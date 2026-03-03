#!/usr/bin/env node
/**
 * Claude Code GitLab MCP Connector
 *
 * Supports two transport modes:
 *   stdio  — for Claude Code CLI (default)
 *   http   — for Claude.ai web connectors (remote MCP)
 *
 * Environment variables:
 *   GITLAB_URL    GitLab instance URL (default: https://gitlab.com)
 *   GITLAB_TOKEN  Personal Access Token with api scope  [required]
 *   MODE          Transport mode: stdio | http           (default: stdio)
 *   PORT          HTTP port (http mode only)             (default: 3000)
 *   MCP_SECRET    Bearer token for auth (http mode only) [required in http mode]
 */
import http from "node:http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
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
const MCP_SECRET = process.env.MCP_SECRET ?? "";
if (!GITLAB_TOKEN) {
    console.error("Error: GITLAB_TOKEN environment variable is required.\n" +
        "Create a Personal Access Token at: <your-gitlab-url>/-/user_settings/personal_access_tokens\n" +
        "Required scope: api");
    process.exit(1);
}
if (MODE === "http" && !MCP_SECRET) {
    console.error("Error: MCP_SECRET environment variable is required in http mode.\n" +
        "Set a strong random secret, e.g.: MCP_SECRET=$(openssl rand -hex 32)");
    process.exit(1);
}
// ── Tool registry ─────────────────────────────────────────────────────────────
const client = new GitLabClient({ baseUrl: GITLAB_URL, token: GITLAB_TOKEN });
const allTools = [
    ...projectTools(client),
    ...repositoryTools(client),
    ...issueTools(client),
    ...mergeRequestTools(client),
    ...pipelineTools(client),
];
const toolMap = new Map(allTools.map((t) => [t.name, t]));
// ── MCP Server factory ────────────────────────────────────────────────────────
function createMcpServer() {
    const server = new Server({ name: "claude-gitlab-plugin", version: "1.0.0" }, { capabilities: { tools: {} } });
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        const tools = allTools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: zodToJsonSchema(t.inputSchema),
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                isError: true,
                content: [{ type: "text", text: `Tool error: ${message}` }],
            };
        }
    });
    return server;
}
// ── stdio mode (Claude Code CLI) ──────────────────────────────────────────────
async function startStdio() {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`GitLab MCP connector running (stdio) — ${GITLAB_URL}`);
}
// ── HTTP mode (Claude.ai web connector) ───────────────────────────────────────
async function startHttp() {
    const httpServer = http.createServer(async (req, res) => {
        // Auth check — Bearer token
        const authHeader = req.headers["authorization"] ?? "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : "";
        if (token !== MCP_SECRET) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Unauthorized" }));
            return;
        }
        // Only handle POST /mcp (Streamable HTTP transport endpoint)
        if (req.method !== "POST" || req.url !== "/mcp") {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Not found. Use POST /mcp" }));
            return;
        }
        // Each request gets its own server + transport (stateless)
        const server = createMcpServer();
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // stateless
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, await readBody(req));
        await server.close();
    });
    httpServer.listen(PORT, () => {
        console.error(`GitLab MCP connector running (http) on port ${PORT}\n` +
            `Endpoint: POST http://0.0.0.0:${PORT}/mcp\n` +
            `Auth:     Bearer $MCP_SECRET\n` +
            `GitLab:   ${GITLAB_URL}`);
    });
}
function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => {
            try {
                const raw = Buffer.concat(chunks).toString("utf-8");
                resolve(raw ? JSON.parse(raw) : {});
            }
            catch {
                reject(new Error("Invalid JSON body"));
            }
        });
        req.on("error", reject);
    });
}
// ── Entry point ───────────────────────────────────────────────────────────────
if (MODE === "http") {
    startHttp().catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
}
else {
    startStdio().catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map