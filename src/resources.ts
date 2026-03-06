import { GitLabClient } from "./gitlab-client.js";

/**
 * MCP Resources for GitLab content.
 *
 * File URI:     gitlab://{project_id}/{ref}/{+file_path}
 * Job log URI:  gitlab-job-log://{project_id}/{job_id}
 * Pipeline URI: gitlab-pipeline://{project_id}/{pipeline_id}
 *
 * Using resources instead of tools reduces token usage:
 * resource contents are loaded once by the MCP client and can be referenced
 * without repeating the full content in the conversation history.
 *
 * Pipeline resources additionally support MCP subscriptions: subscribe once
 * and the server notifies the client on every status change, eliminating
 * the need for the LLM to poll repeatedly.
 */

export const GITLAB_FILE_TEMPLATE     = "gitlab://{project_id}/{ref}/{+file_path}";
export const GITLAB_JOB_LOG_TEMPLATE  = "gitlab-job-log://{project_id}/{job_id}";
export const GITLAB_PIPELINE_TEMPLATE = "gitlab-pipeline://{project_id}/{pipeline_id}";

/** Terminal pipeline states — polling stops when one of these is reached. */
export const PIPELINE_TERMINAL_STATES = new Set([
  "success", "failed", "canceled", "skipped", "blocked",
]);

// ── File resource ─────────────────────────────────────────────────────────────

export function parseGitlabUri(uri: string): {
  project_id: string;
  ref: string;
  file_path: string;
} | null {
  const match = uri.match(/^gitlab:\/\/([^/]+)\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return {
    project_id: decodeURIComponent(match[1]),
    ref: match[2],
    file_path: match[3],
  };
}

export async function readGitlabResource(
  client: GitLabClient,
  uri: string
): Promise<{ uri: string; mimeType: string; text: string }> {
  const parsed = parseGitlabUri(uri);
  if (!parsed) {
    throw new Error(
      `Invalid GitLab resource URI: "${uri}". Expected format: gitlab://{project_id}/{ref}/{file_path}`
    );
  }

  const file = await client.getFile(parsed.project_id, parsed.file_path, parsed.ref);
  const text =
    file.encoding === "base64"
      ? Buffer.from(file.content, "base64").toString("utf-8")
      : file.content;

  return { uri, mimeType: guessMimeType(parsed.file_path), text };
}

// ── Job log resource ──────────────────────────────────────────────────────────

export function parseJobLogUri(uri: string): {
  project_id: string;
  job_id: number;
} | null {
  const match = uri.match(/^gitlab-job-log:\/\/([^/]+)\/(\d+)$/);
  if (!match) return null;
  return {
    project_id: decodeURIComponent(match[1]),
    job_id: parseInt(match[2], 10),
  };
}

export async function readJobLogResource(
  client: GitLabClient,
  uri: string
): Promise<{ uri: string; mimeType: string; text: string }> {
  const parsed = parseJobLogUri(uri);
  if (!parsed) {
    throw new Error(
      `Invalid job log URI: "${uri}". Expected format: gitlab-job-log://{project_id}/{job_id}`
    );
  }

  const log = await client.getJobLog(parsed.project_id, parsed.job_id);
  return { uri, mimeType: "text/plain", text: log };
}

// ── Pipeline resource ─────────────────────────────────────────────────────────

export function parsePipelineUri(uri: string): {
  project_id: string;
  pipeline_id: number;
} | null {
  const match = uri.match(/^gitlab-pipeline:\/\/([^/]+)\/(\d+)$/);
  if (!match) return null;
  return {
    project_id: decodeURIComponent(match[1]),
    pipeline_id: parseInt(match[2], 10),
  };
}

export async function readPipelineResource(
  client: GitLabClient,
  uri: string
): Promise<{ uri: string; mimeType: string; text: string }> {
  const parsed = parsePipelineUri(uri);
  if (!parsed) {
    throw new Error(
      `Invalid pipeline URI: "${uri}". Expected format: gitlab-pipeline://{project_id}/{pipeline_id}`
    );
  }

  const pipeline = await client.getPipeline(parsed.project_id, parsed.pipeline_id);
  return { uri, mimeType: "application/json", text: JSON.stringify(pipeline, null, 2) };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function guessMimeType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "text/plain",
    tsx: "text/plain",
    js: "text/javascript",
    jsx: "text/javascript",
    json: "application/json",
    md: "text/markdown",
    yml: "text/yaml",
    yaml: "text/yaml",
    py: "text/x-python",
    rb: "text/x-ruby",
    go: "text/x-go",
    rs: "text/x-rust",
    java: "text/x-java",
    sh: "text/x-sh",
    html: "text/html",
    css: "text/css",
    sql: "text/x-sql",
    dockerfile: "text/plain",
  };
  return map[ext ?? ""] ?? "text/plain";
}
