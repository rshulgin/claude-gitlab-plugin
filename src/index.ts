#!/usr/bin/env node
/**
 * Claude Code GitLab MCP Connector
 *
 * An MCP (Model Context Protocol) server that connects Claude Code to GitLab,
 * providing tools for repositories, issues, merge requests, and CI/CD pipelines.
 *
 * Configuration via environment variables:
 *   GITLAB_URL   - GitLab instance URL (default: https://gitlab.com)
 *   GITLAB_TOKEN - Personal Access Token with api scope
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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

if (!GITLAB_TOKEN) {
  console.error(
    "Error: GITLAB_TOKEN environment variable is required.\n" +
      "Create a Personal Access Token at: <your-gitlab-url>/-/user_settings/personal_access_tokens\n" +
      "Required scope: api"
  );
  process.exit(1);
}

// ── Build tool registry ───────────────────────────────────────────────────────

const client = new GitLabClient({ baseUrl: GITLAB_URL, token: GITLAB_TOKEN });

type ToolHandler = {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (input: unknown) => Promise<unknown>;
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

// ── MCP Server ────────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "claude-gitlab-plugin",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = allTools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.inputSchema) as Tool["inputSchema"],
  }));
  return { tools };
});

// Call a tool
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
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    return {
      isError: true,
      content: [{ type: "text", text: `Tool error: ${message}` }],
    };
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `GitLab MCP connector running — connected to ${GITLAB_URL}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
