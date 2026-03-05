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

// ── Authorization Code store (OAuth 2.1 + PKCE) ───────────────────────────────

type AuthCodeEntry = {
  client_id: string;
  redirect_uri: string;
  code_challenge?: string;
  code_challenge_method?: string;
  expires: number;
};

const authCodeStore = new Map<string, AuthCodeEntry>();

function issueAuthCode(entry: Omit<AuthCodeEntry, "expires">): string {
  const code = crypto.randomBytes(16).toString("hex");
  authCodeStore.set(code, { ...entry, expires: Date.now() + 60_000 }); // 1 min
  return code;
}

function verifyPKCE(
  verifier: string,
  challenge: string,
  method: string
): boolean {
  if (method === "S256") {
    const hash = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");
    return hash === challenge;
  }
  return verifier === challenge; // plain (not recommended but spec allows it)
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

function log(status: number, req: http.IncomingMessage, extra?: string): void {
  const ts = new Date().toISOString();
  const ua = (req.headers["user-agent"] ?? "").slice(0, 60);
  const base = `[${ts}] ${status} ${req.method} ${req.url}`;
  console.error(extra ? `${base} — ${extra}` : base);
  if (ua) console.error(`          UA: ${ua}`);
}

async function requestHandler(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  // ── OAuth Protected Resource Metadata (RFC 9470) ────────────────────────
  if (
    req.method === "GET" &&
    req.url === "/.well-known/oauth-protected-resource"
  ) {
    log(200, req);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        resource: SERVER_URL,
        authorization_servers: [SERVER_URL],
      })
    );
    return;
  }

  // ── OAuth discovery (RFC 8414) ───────────────────────────────────────────
  if (
    req.method === "GET" &&
    req.url === "/.well-known/oauth-authorization-server"
  ) {
    log(200, req);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        issuer: SERVER_URL,
        authorization_endpoint: `${SERVER_URL}/oauth/authorize`,
        token_endpoint: `${SERVER_URL}/oauth/token`,
        grant_types_supported: ["authorization_code", "client_credentials"],
        response_types_supported: ["code"],
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: [
          "client_secret_post",
          "none",
        ],
      })
    );
    return;
  }

  // ── OAuth authorization endpoint (Authorization Code flow) ───────────────
  if (req.method === "GET" && req.url?.startsWith("/oauth/authorize")) {
    if (!useOAuth) {
      log(404, req, "OAuth not configured");
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "OAuth not configured" }));
      return;
    }
    const urlObj = new URL(req.url, SERVER_URL);
    const clientId = urlObj.searchParams.get("client_id") ?? "";
    const redirectUri = urlObj.searchParams.get("redirect_uri") ?? "";
    const state = urlObj.searchParams.get("state") ?? "";
    const codeChallenge = urlObj.searchParams.get("code_challenge") ?? undefined;
    const codeChallengeMethod =
      urlObj.searchParams.get("code_challenge_method") ?? undefined;

    if (!redirectUri) {
      log(400, req, "missing redirect_uri");
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "missing redirect_uri" }));
      return;
    }

    // Auto-approve: issue authorization code and redirect back immediately
    const code = issueAuthCode({
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    const redirect = new URL(redirectUri);
    redirect.searchParams.set("code", code);
    if (state) redirect.searchParams.set("state", state);

    log(302, req, `client_id=${clientId} redirect=${redirectUri}`);
    res.writeHead(302, { Location: redirect.toString() });
    res.end();
    return;
  }

  // ── OAuth token endpoint ─────────────────────────────────────────────────
  if (req.method === "POST" && req.url === "/oauth/token") {
    if (!useOAuth) {
      log(404, req, "OAuth not configured");
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "OAuth not configured" }));
      return;
    }
    const raw = await readBodyRaw(req);
    const params = new URLSearchParams(raw);
    const grantType = params.get("grant_type");

    if (grantType === "authorization_code") {
      const code = params.get("code") ?? "";
      const redirectUri = params.get("redirect_uri") ?? "";
      const codeVerifier = params.get("code_verifier") ?? undefined;

      const entry = authCodeStore.get(code);
      if (!entry || Date.now() > entry.expires) {
        log(400, req, "invalid_grant (code not found or expired)");
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_grant" }));
        return;
      }
      authCodeStore.delete(code); // single-use

      if (entry.redirect_uri !== redirectUri) {
        log(400, req, `redirect_uri_mismatch: got=${redirectUri} want=${entry.redirect_uri}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "redirect_uri_mismatch" }));
        return;
      }

      // Verify PKCE if present
      if (entry.code_challenge && entry.code_challenge_method) {
        if (!codeVerifier) {
          log(400, req, "missing code_verifier");
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "missing code_verifier" }));
          return;
        }
        if (
          !verifyPKCE(
            codeVerifier,
            entry.code_challenge,
            entry.code_challenge_method
          )
        ) {
          log(400, req, "PKCE verification failed");
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "invalid_grant" }));
          return;
        }
      }

      log(200, req, `token issued (grant=authorization_code)`);
      const token = issueToken();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ...token, token_type: "Bearer" }));
      return;
    }

    if (grantType === "client_credentials") {
      if (
        params.get("client_id") !== OAUTH_CLIENT_ID ||
        params.get("client_secret") !== OAUTH_CLIENT_SECRET
      ) {
        log(401, req, "invalid_client");
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "invalid_client" }));
        return;
      }
      log(200, req, "token issued (grant=client_credentials)");
      const token = issueToken();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ...token, token_type: "Bearer" }));
      return;
    }

    log(400, req, `unsupported_grant_type: ${grantType}`);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "unsupported_grant_type" }));
    return;
  }

  // ── Auth check ───────────────────────────────────────────────────────────
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!isValidToken(token)) {
    log(401, req, "no valid Bearer token");
    res.writeHead(401, {
      "Content-Type": "application/json",
      "WWW-Authenticate": `Bearer realm="${SERVER_URL}", resource_metadata="${SERVER_URL}/.well-known/oauth-protected-resource"`,
    });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  // ── MCP endpoint ─────────────────────────────────────────────────────────
  if (req.url !== "/mcp") {
    log(404, req);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use /mcp" }));
    return;
  }

  log(200, req, "MCP request");
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });
  await server.connect(transport);
  const raw = req.method === "POST" ? await readBodyRaw(req) : undefined;
  await transport.handleRequest(req, res, raw ? JSON.parse(raw) : undefined);
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

  // Log every incoming TCP connection (before TLS handshake / HTTP parsing)
  server.on("connection", (socket) => {
    const remote = `${socket.remoteAddress}:${socket.remotePort}`;
    console.error(`[TCP] connection from ${remote}`);
    socket.on("close", (hadError: boolean) => {
      console.error(`[TCP] closed ${remote}${hadError ? " (error)" : ""}`);
    });
    socket.on("error", (err: Error) => {
      console.error(`[TCP] error ${remote}: ${err.message}`);
    });
  });

  if (useHttps) {
    // For HTTPS: log successful TLS handshakes and TLS-level errors separately
    (server as https.Server).on("secureConnection", (socket) => {
      const tlsSock = socket as import("tls").TLSSocket;
      console.error(`[TLS] handshake OK from ${tlsSock.remoteAddress} (${tlsSock.getProtocol() ?? "?"}) sni=${tlsSock.servername ?? "none"}`);
    });
    (server as https.Server).on("tlsClientError", (err: Error, socket) => {
      const tlsSock = socket as import("tls").TLSSocket;
      console.error(`[TLS] handshake FAILED from ${tlsSock.remoteAddress ?? "?"}: ${err.message}`);
    });
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
