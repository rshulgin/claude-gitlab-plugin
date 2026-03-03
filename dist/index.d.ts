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
export {};
//# sourceMappingURL=index.d.ts.map