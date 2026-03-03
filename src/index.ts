#!/usr/bin/env node
import "dotenv/config";

/**
 * Claude Code GitLab MCP Connector
 *
 * Supports two transport modes:
 *   stdio  — for Claude Code CLI (default)
 *   http   — for Claude.ai web connectors (remote MCP)
 *
 * Environment variables (see .env.example):
 *   GITLAB_URL          GitLab instance URL              (default: https://gitlab.com)
 *   GITLAB_TOKEN        Personal Access Token (api scope) [required]
 *   MODE                Transport mode: stdio | http      (default: stdio)
 *   PORT                HTTP(S) port                      (default: 3000)
 *   SSL_CERT_PATH       Path to TLS certificate           (enables HTTPS)
 *   SSL_KEY_PATH        Path to TLS private key           (enables HTTPS)
 *   SERVER_URL          Public URL of this server         (used in OAuth metadata)
 *   OAUTH_CLIENT_ID     OAuth 2.0 client ID               [recommended]
 *   OAUTH_CLIENT_SECRET OAuth 2.0 client secret           [recommended]
 *   MCP_SECRET          Legacy static Bearer token        (fallback)
 */

import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import crypto from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { GitLabClient } from "./gitlab-client.js";
import { projectTools } from "./tools/projects.js";
import { repositoryTools } from "./tools/repository.js";
import { issueTools } from "./tools/issues.js";
import { mergeRequestTools } from "./tools/merge-requests.js";
import { pipelineTools } from "./tools/pipelines.js";

// ── Configuration ─────────────────────────────────────────────────────────────

const GITLAB_URL = process.env.GITLAB_URL ?? "https://gitlab.com";
const GITLAB_TOKEN = process.env.GITLAB_TOKEN ?? "";
const MODE = process.env.MODE ?? "stdio";
const PORT = parseInt(process.env.PORT ?? "3000", 10);
const SSL_CERT_PATH = process.env.SSL_CERT_PATH ?? "";
const SSL_KEY_PATH = process.env.SSL_KEY_PATH ?? "";
const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID ?? "";
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET ?? "";
const MCP_SECRET = process.env.MCP_SECRET ?? ""; // legacy Bearer token

const useHttps = !!(SSL_CERT_PATH && SSL_KEY_PATH);
const useOAuth = !!(OAUTH_CLIENT_ID && OAUTH_CLIENT_SECRET);
const defaultProto = useHttps ? "https" : "http";
const SERVER_URL =
  process.env.SERVER_URL ?? `${defaultProto}://localhost:${PORT}`;

if (!GITLAB_TOKEN) {
  console.error(
    "Error: GITLAB_TOKEN is required.\n" +
      "Create a Personal Access Token at: <your-gitlab-url>/-/user_settings/personal_access_tokens\n" +
      "Required scope: api"
  );
  process.exit(1);
}

if (MODE === "http" && !useOAuth && !MCP_SECRET) {
  console.error(
    "Error: authentication must be configured in http mode.\n" +
      "Option A (OAuth, recommended): set OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET\n" +
      "Option B (legacy Bearer):      set MCP_SECRET"
  );
  process.exit(1);
}

// ── OAuth token store ─────────────────────────────────────────────────────────

const tokenStore = new Map<string, number>(); // token → expiry (ms epoch)

function issueToken(): { access_token: string; expires_in: number } {
  const access_token = crypto.randomBytes(32).toString("hex");
  const expires_in = 3600;
  tokenStore.set(access_token, Date.now() + expires_in * 1000);
  return { access_token, expires_in };
}

function isValidToken(token: string): boolean {
  if (MCP_SECRET && token === MCP_SECRET) return true; // legacy static secret

  const expiry = tokenStore.get(token);
  if (expiry === undefined) return false;
  if (Date.now() > expiry) {
    tokenStore.delete(token);
    return false;
  }
  return true;
}

// ── Tool registry ─────────────────────────────────────────────────────────────

const client = new GitLabClient({ baseUrl: GITLAB_URL, token: GITLAB_TOKEN });

type ToolHandler = {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (input: any) => Promise<unknown>;
};

const allTools: ToolHandler[] = [
  ...projectTools(client),
  ...repositoryTools(client),
  ...issueTools(client),
  ...mergeRequestTools(client),
  ...pipelineTools(client),
];

const toolMap = new Map<string, ToolHandler>(
  allTools.map((t) => [t.name, t])
);

// ── MCP Server factory ────────────────────────────────────────────────────────

function createMcpServer(): Server {
  const server = new Server(
    { name: "claude-gitlab-plugin", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools: Tool[] = allTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: zodToJsonSchema(t.inputSchema) as Tool["inputSchema"],
    }));
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = toolMap.get(name);
    if (!tool) {
      return {
        isError: true,
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
      };
    }
    try {
      const parsed = tool.inputSchema.parse(args ?? {});
      const result = await tool.handler(parsed);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [{ type: "text", text: `Tool error: ${message}` }],
      };
    }
  });

  return server;
}

// ── stdio mode ────────────────────────────────────────────────────────────────

async function startStdio(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`GitLab MCP connector running (stdio) — ${GITLAB_URL}`);
}

// ── HTTP/HTTPS mode ───────────────────────────────────────────────────────────

async function requestHandler(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  // ── OAuth discovery (RFC 8414) ───────────────────────────────────────────
  if (
    req.method === "GET" &&
    req.url === "/.well-known/oauth-authorization-server"
  ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        issuer: SERVER_URL,
        token_endpoint: `${SERVER_URL}/oauth/token`,
        grant_types_supported: ["client_credentials"],
        token_endpoint_auth_methods_supported: ["client_secret_post"],
      })
    );
    return;
  }

  // ── OAuth token endpoint ─────────────────────────────────────────────────
  if (req.method === "POST" && req.url === "/oauth/token") {
    if (!useOAuth) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "OAuth not configured" }));
      return;
    }
    const raw = await readBodyRaw(req);
    const params = new URLSearchParams(raw);
    if (
      params.get("grant_type") !== "client_credentials" ||
      params.get("client_id") !== OAUTH_CLIENT_ID ||
      params.get("client_secret") !== OAUTH_CLIENT_SECRET
    ) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "invalid_client" }));
      return;
    }
    const token = issueToken();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ...token, token_type: "Bearer" }));
    return;
  }

  // ── Auth check ───────────────────────────────────────────────────────────
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!isValidToken(token)) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  // ── MCP endpoint ─────────────────────────────────────────────────────────
  if (req.method !== "POST" || req.url !== "/mcp") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use POST /mcp" }));
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });
  await server.connect(transport);
  const raw = await readBodyRaw(req);
  await transport.handleRequest(req, res, raw ? JSON.parse(raw) : {});
  await server.close();
}

async function startHttp(): Promise<void> {
  const wrapHandler = (
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void => {
    requestHandler(req, res).catch((err) => {
      console.error("Request error:", err);
      if (!res.headersSent) res.writeHead(500).end();
    });
  };

  let server: http.Server | https.Server;
  if (useHttps) {
    let cert: Buffer, key: Buffer;
    try {
      cert = fs.readFileSync(SSL_CERT_PATH);
      key = fs.readFileSync(SSL_KEY_PATH);
    } catch (err: unknown) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === "EACCES") {
        console.error(
          `Error: cannot read SSL certificate/key (permission denied).\n` +
            `  cert: ${SSL_CERT_PATH}\n` +
            `  key:  ${SSL_KEY_PATH}\n\n` +
            `Fix options:\n` +
            `  1. Run the server as root (not recommended)\n` +
            `  2. Copy certs to a user-readable location:\n` +
            `       sudo cp ${SSL_CERT_PATH} ~/cert.pem\n` +
            `       sudo cp ${SSL_KEY_PATH} ~/key.pem\n` +
            `       sudo chown $USER ~/cert.pem ~/key.pem\n` +
            `  3. Use a reverse proxy (nginx/caddy) that handles TLS\n` +
            `     and set MODE=http with the proxy forwarding to this server.`
        );
      } else {
        console.error(`Error: failed to read SSL files — ${e.message}`);
      }
      process.exit(1);
    }
    server = https.createServer({ cert, key }, wrapHandler);
  } else {
    server = http.createServer(wrapHandler);
  }

  server.listen(PORT, () => {
    const proto = useHttps ? "https" : "http";
    const authMode = useOAuth
      ? `OAuth 2.0  → POST ${SERVER_URL}/oauth/token`
      : `Bearer token (legacy MCP_SECRET)`;
    console.error(
      `GitLab MCP connector running (${proto}) on port ${PORT}\n` +
        `MCP:      POST ${SERVER_URL}/mcp\n` +
        `Auth:     ${authMode}\n` +
        `GitLab:   ${GITLAB_URL}`
    );
  });
}

function readBodyRaw(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

// ── Entry point ───────────────────────────────────────────────────────────────

if (MODE === "http") {
  startHttp().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
} else {
  startStdio().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
}
