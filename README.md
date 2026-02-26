# Claude Code GitLab Connector

An MCP (Model Context Protocol) server that connects Claude Code to GitLab, giving Claude the ability to interact with your GitLab repositories, issues, merge requests, and CI/CD pipelines directly from the chat.

## Features

| Category | Tools |
|---|---|
| **Projects** | List projects, get project details, list members, get current user |
| **Repository** | Read files, browse directory tree, list/create branches, list commits, search code, create/update files, compare refs |
| **Issues** | List, get, create, update issues; list and create comments |
| **Merge Requests** | List, get, create, update, accept MRs; get diffs; list and create comments |
| **CI/CD Pipelines** | List, get, trigger, retry, cancel pipelines; list jobs; get job logs |

## Requirements

- Node.js ≥ 18
- A GitLab Personal Access Token with **`api`** scope

## Installation

```bash
git clone <repo-url>
cd Claude-Gitlab-Plugin
npm install
npm run build
```

## Configuration

The connector is configured via environment variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `GITLAB_TOKEN` | **Yes** | — | Personal Access Token with `api` scope |
| `GITLAB_URL` | No | `https://gitlab.com` | GitLab instance URL (for self-hosted GitLab) |

### Creating a GitLab Personal Access Token

1. Go to your GitLab instance → **User Settings** → **Access Tokens**
2. Create a token with the **`api`** scope
3. Copy the token value

## Adding to Claude Code

Add the connector to your Claude Code MCP configuration (`~/.claude.json` or `.claude/mcp.json`):

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/Claude-Gitlab-Plugin/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx",
        "GITLAB_URL": "https://gitlab.com"
      }
    }
  }
}
```

For self-hosted GitLab:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/path/to/Claude-Gitlab-Plugin/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "glpat-xxxxxxxxxxxxxxxxxxxx",
        "GITLAB_URL": "https://gitlab.mycompany.com"
      }
    }
  }
}
```

## Available Tools

### Projects

- **`gitlab_list_projects`** — List accessible projects (filter by owned, membership, search)
- **`gitlab_get_project`** — Get full project details by ID or `group/repo` path
- **`gitlab_get_current_user`** — Get info about the authenticated user
- **`gitlab_list_project_members`** — List project members

### Repository

- **`gitlab_get_file`** — Read a file's content from a branch/commit
- **`gitlab_list_tree`** — Browse directory contents (supports recursive listing)
- **`gitlab_list_branches`** — List branches (with optional search filter)
- **`gitlab_create_branch`** — Create a new branch from a ref
- **`gitlab_list_commits`** — List commits (filter by branch, date range, or file path)
- **`gitlab_get_commit`** — Get a commit with its change statistics
- **`gitlab_search_code`** — Full-text code search within a project
- **`gitlab_create_file`** — Create a new file with a commit
- **`gitlab_update_file`** — Update an existing file with a commit
- **`gitlab_compare_refs`** — Diff two branches/tags/commits

### Issues

- **`gitlab_list_issues`** — List issues (filter by state, labels, assignee, milestone)
- **`gitlab_get_issue`** — Get a specific issue by IID
- **`gitlab_create_issue`** — Create a new issue
- **`gitlab_update_issue`** — Update issue fields or change state (close/reopen)
- **`gitlab_list_issue_comments`** — List comments on an issue
- **`gitlab_create_issue_comment`** — Add a comment to an issue

### Merge Requests

- **`gitlab_list_merge_requests`** — List MRs (filter by state, branch, assignee)
- **`gitlab_get_merge_request`** — Get a specific MR by IID
- **`gitlab_create_merge_request`** — Open a new merge request
- **`gitlab_update_merge_request`** — Update MR fields or state
- **`gitlab_accept_merge_request`** — Merge a ready MR
- **`gitlab_get_merge_request_diff`** — Get file diffs for an MR
- **`gitlab_list_mr_comments`** — List comments on an MR
- **`gitlab_create_mr_comment`** — Add a comment to an MR

### CI/CD Pipelines

- **`gitlab_list_pipelines`** — List pipelines (filter by status, branch, SHA)
- **`gitlab_get_pipeline`** — Get pipeline details
- **`gitlab_create_pipeline`** — Trigger a new pipeline with optional variables
- **`gitlab_retry_pipeline`** — Retry failed jobs in a pipeline
- **`gitlab_cancel_pipeline`** — Cancel a running pipeline
- **`gitlab_list_pipeline_jobs`** — List all jobs in a pipeline
- **`gitlab_get_job_log`** — Get the console log of a job

## Example Usage

Once connected, you can ask Claude things like:

- *"List open issues in my-group/my-project"*
- *"Show me the diff for MR #42 in my-group/my-project"*
- *"Create a new issue titled 'Fix login bug' in my-group/my-project"*
- *"What's the status of the latest pipeline on the main branch?"*
- *"Read the contents of src/main.py from the feature/new-api branch"*
- *"Search for 'TODO' in the codebase of my-group/my-project"*
- *"Create a merge request from feature/login to main"*

## Development

```bash
# Install dependencies
npm install

# Type-check without building
npm run typecheck

# Build
npm run build

# Run directly (development)
GITLAB_TOKEN=xxx npm run dev
```

## Project Structure

```
src/
├── index.ts              # MCP server entry point
├── gitlab-client.ts      # GitLab REST API v4 client
└── tools/
    ├── projects.ts       # Project & user tools
    ├── repository.ts     # Repository, file & branch tools
    ├── issues.ts         # Issue tools
    ├── merge-requests.ts # Merge request tools
    └── pipelines.ts      # CI/CD pipeline tools
```

## License

MIT
