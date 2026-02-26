/**
 * GitLab API client for the Claude Code MCP connector.
 * Wraps GitLab REST API v4 endpoints.
 */

export interface GitLabConfig {
  baseUrl: string;
  token: string;
}

export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  description: string | null;
  default_branch: string;
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  visibility: string;
  open_issues_count: number;
  star_count: number;
  forks_count: number;
  created_at: string;
  last_activity_at: string;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: string;
  labels: string[];
  author: GitLabUser;
  assignees: GitLabUser[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  web_url: string;
  milestone: GitLabMilestone | null;
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: string;
  source_branch: string;
  target_branch: string;
  author: GitLabUser;
  assignees: GitLabUser[];
  labels: string[];
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  web_url: string;
  merge_status: string;
  draft: boolean;
  milestone: GitLabMilestone | null;
  diff_refs: {
    base_sha: string;
    head_sha: string;
    start_sha: string;
  } | null;
}

export interface GitLabUser {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
  web_url: string;
}

export interface GitLabMilestone {
  id: number;
  iid: number;
  title: string;
  description: string | null;
  state: string;
  due_date: string | null;
}

export interface GitLabNote {
  id: number;
  body: string;
  author: GitLabUser;
  created_at: string;
  updated_at: string;
  resolvable: boolean;
  resolved: boolean | null;
  system: boolean;
}

export interface GitLabPipeline {
  id: number;
  iid: number;
  project_id: number;
  sha: string;
  ref: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  web_url: string;
  duration: number | null;
}

export interface GitLabBranch {
  name: string;
  commit: {
    id: string;
    short_id: string;
    title: string;
    author_name: string;
    authored_date: string;
    committed_date: string;
    web_url: string;
  };
  merged: boolean;
  protected: boolean;
  default: boolean;
  web_url: string;
}

export interface GitLabFile {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content: string;
  content_sha256: string;
  ref: string;
  blob_id: string;
  commit_id: string;
  last_commit_id: string;
}

export interface GitLabTreeItem {
  id: string;
  name: string;
  type: "blob" | "tree";
  path: string;
  mode: string;
}

export interface GitLabCommit {
  id: string;
  short_id: string;
  title: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committed_date: string;
  message: string;
  web_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface GitLabSearchResult {
  basename: string;
  data: string;
  path: string;
  filename: string;
  id: string | null;
  ref: string;
  startline: number;
  project_id: number;
}

export interface GitLabJob {
  id: number;
  name: string;
  stage: string;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration: number | null;
  web_url: string;
  ref: string;
  pipeline: {
    id: number;
    status: string;
    ref: string;
    sha: string;
  };
}

export class GitLabClient {
  private baseUrl: string;
  private token: string;

  constructor(config: GitLabConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.token = config.token;
  }

  private async request<T>(
    path: string,
    options: {
      method?: string;
      body?: unknown;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<T> {
    const { method = "GET", body, params } = options;

    const url = new URL(`${this.baseUrl}/api/v4${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      "PRIVATE-TOKEN": this.token,
      "Content-Type": "application/json",
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `GitLab API error ${response.status} ${response.statusText}: ${errorText}`
      );
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  private encodeProjectId(projectId: string | number): string {
    if (typeof projectId === "number") return String(projectId);
    return encodeURIComponent(projectId);
  }

  // ── Projects ───────────────────────────────────────────────────────────────

  async listProjects(params?: {
    search?: string;
    owned?: boolean;
    membership?: boolean;
    per_page?: number;
    page?: number;
    order_by?: string;
    sort?: string;
  }): Promise<GitLabProject[]> {
    return this.request<GitLabProject[]>("/projects", { params: params as Record<string, string | number | boolean | undefined> });
  }

  async getProject(projectId: string | number): Promise<GitLabProject> {
    return this.request<GitLabProject>(
      `/projects/${this.encodeProjectId(projectId)}`
    );
  }

  // ── Repository ─────────────────────────────────────────────────────────────

  async getFile(
    projectId: string | number,
    filePath: string,
    ref: string = "HEAD"
  ): Promise<GitLabFile> {
    return this.request<GitLabFile>(
      `/projects/${this.encodeProjectId(projectId)}/repository/files/${encodeURIComponent(filePath)}`,
      { params: { ref } }
    );
  }

  async listTree(
    projectId: string | number,
    params?: {
      path?: string;
      ref?: string;
      recursive?: boolean;
      per_page?: number;
      page?: number;
    }
  ): Promise<GitLabTreeItem[]> {
    return this.request<GitLabTreeItem[]>(
      `/projects/${this.encodeProjectId(projectId)}/repository/tree`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async listCommits(
    projectId: string | number,
    params?: {
      ref_name?: string;
      since?: string;
      until?: string;
      path?: string;
      per_page?: number;
      page?: number;
    }
  ): Promise<GitLabCommit[]> {
    return this.request<GitLabCommit[]>(
      `/projects/${this.encodeProjectId(projectId)}/repository/commits`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async getCommit(
    projectId: string | number,
    sha: string
  ): Promise<GitLabCommit> {
    return this.request<GitLabCommit>(
      `/projects/${this.encodeProjectId(projectId)}/repository/commits/${sha}`
    );
  }

  async listBranches(
    projectId: string | number,
    params?: { search?: string; per_page?: number; page?: number }
  ): Promise<GitLabBranch[]> {
    return this.request<GitLabBranch[]>(
      `/projects/${this.encodeProjectId(projectId)}/repository/branches`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async createBranch(
    projectId: string | number,
    branch: string,
    ref: string
  ): Promise<GitLabBranch> {
    return this.request<GitLabBranch>(
      `/projects/${this.encodeProjectId(projectId)}/repository/branches`,
      { method: "POST", body: { branch, ref } }
    );
  }

  async createFile(
    projectId: string | number,
    filePath: string,
    params: {
      branch: string;
      content: string;
      commit_message: string;
      encoding?: string;
    }
  ): Promise<{ file_path: string; branch: string }> {
    return this.request(
      `/projects/${this.encodeProjectId(projectId)}/repository/files/${encodeURIComponent(filePath)}`,
      { method: "POST", body: params }
    );
  }

  async updateFile(
    projectId: string | number,
    filePath: string,
    params: {
      branch: string;
      content: string;
      commit_message: string;
      last_commit_id?: string;
      encoding?: string;
    }
  ): Promise<{ file_path: string; branch: string }> {
    return this.request(
      `/projects/${this.encodeProjectId(projectId)}/repository/files/${encodeURIComponent(filePath)}`,
      { method: "PUT", body: params }
    );
  }

  async searchCode(
    projectId: string | number,
    query: string,
    ref?: string
  ): Promise<GitLabSearchResult[]> {
    return this.request<GitLabSearchResult[]>(
      `/projects/${this.encodeProjectId(projectId)}/search`,
      { params: { scope: "blobs", search: query, ref } }
    );
  }

  async compareRefs(
    projectId: string | number,
    from: string,
    to: string
  ): Promise<{
    commit: GitLabCommit;
    commits: GitLabCommit[];
    diffs: Array<{
      old_path: string;
      new_path: string;
      diff: string;
      new_file: boolean;
      renamed_file: boolean;
      deleted_file: boolean;
    }>;
  }> {
    return this.request(
      `/projects/${this.encodeProjectId(projectId)}/repository/compare`,
      { params: { from, to } }
    );
  }

  // ── Issues ─────────────────────────────────────────────────────────────────

  async listIssues(
    projectId: string | number,
    params?: {
      state?: string;
      labels?: string;
      milestone?: string;
      assignee_username?: string;
      search?: string;
      per_page?: number;
      page?: number;
      order_by?: string;
      sort?: string;
    }
  ): Promise<GitLabIssue[]> {
    return this.request<GitLabIssue[]>(
      `/projects/${this.encodeProjectId(projectId)}/issues`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async getIssue(
    projectId: string | number,
    issueIid: number
  ): Promise<GitLabIssue> {
    return this.request<GitLabIssue>(
      `/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}`
    );
  }

  async createIssue(
    projectId: string | number,
    params: {
      title: string;
      description?: string;
      labels?: string;
      assignee_ids?: number[];
      milestone_id?: number;
    }
  ): Promise<GitLabIssue> {
    return this.request<GitLabIssue>(
      `/projects/${this.encodeProjectId(projectId)}/issues`,
      { method: "POST", body: params }
    );
  }

  async updateIssue(
    projectId: string | number,
    issueIid: number,
    params: {
      title?: string;
      description?: string;
      state_event?: "close" | "reopen";
      labels?: string;
      assignee_ids?: number[];
      milestone_id?: number;
    }
  ): Promise<GitLabIssue> {
    return this.request<GitLabIssue>(
      `/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}`,
      { method: "PUT", body: params }
    );
  }

  async listIssueNotes(
    projectId: string | number,
    issueIid: number,
    params?: { per_page?: number; page?: number }
  ): Promise<GitLabNote[]> {
    return this.request<GitLabNote[]>(
      `/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}/notes`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async createIssueNote(
    projectId: string | number,
    issueIid: number,
    body: string
  ): Promise<GitLabNote> {
    return this.request<GitLabNote>(
      `/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}/notes`,
      { method: "POST", body: { body } }
    );
  }

  // ── Merge Requests ─────────────────────────────────────────────────────────

  async listMergeRequests(
    projectId: string | number,
    params?: {
      state?: string;
      labels?: string;
      milestone?: string;
      assignee_username?: string;
      source_branch?: string;
      target_branch?: string;
      search?: string;
      per_page?: number;
      page?: number;
      order_by?: string;
      sort?: string;
    }
  ): Promise<GitLabMergeRequest[]> {
    return this.request<GitLabMergeRequest[]>(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async getMergeRequest(
    projectId: string | number,
    mrIid: number
  ): Promise<GitLabMergeRequest> {
    return this.request<GitLabMergeRequest>(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}`
    );
  }

  async createMergeRequest(
    projectId: string | number,
    params: {
      source_branch: string;
      target_branch: string;
      title: string;
      description?: string;
      assignee_ids?: number[];
      labels?: string;
      milestone_id?: number;
      remove_source_branch?: boolean;
      squash?: boolean;
    }
  ): Promise<GitLabMergeRequest> {
    return this.request<GitLabMergeRequest>(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests`,
      { method: "POST", body: params }
    );
  }

  async updateMergeRequest(
    projectId: string | number,
    mrIid: number,
    params: {
      title?: string;
      description?: string;
      state_event?: "close" | "reopen";
      assignee_ids?: number[];
      labels?: string;
      milestone_id?: number;
      target_branch?: string;
      remove_source_branch?: boolean;
      squash?: boolean;
    }
  ): Promise<GitLabMergeRequest> {
    return this.request<GitLabMergeRequest>(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}`,
      { method: "PUT", body: params }
    );
  }

  async acceptMergeRequest(
    projectId: string | number,
    mrIid: number,
    params?: {
      merge_commit_message?: string;
      squash_commit_message?: string;
      squash?: boolean;
      should_remove_source_branch?: boolean;
      merge_when_pipeline_succeeds?: boolean;
    }
  ): Promise<GitLabMergeRequest> {
    return this.request<GitLabMergeRequest>(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/merge`,
      { method: "PUT", body: params }
    );
  }

  async getMergeRequestDiff(
    projectId: string | number,
    mrIid: number
  ): Promise<
    Array<{
      old_path: string;
      new_path: string;
      diff: string;
      new_file: boolean;
      renamed_file: boolean;
      deleted_file: boolean;
    }>
  > {
    return this.request(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/diffs`
    );
  }

  async listMergeRequestNotes(
    projectId: string | number,
    mrIid: number,
    params?: { per_page?: number; page?: number }
  ): Promise<GitLabNote[]> {
    return this.request<GitLabNote[]>(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/notes`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async createMergeRequestNote(
    projectId: string | number,
    mrIid: number,
    body: string
  ): Promise<GitLabNote> {
    return this.request<GitLabNote>(
      `/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/notes`,
      { method: "POST", body: { body } }
    );
  }

  // ── Pipelines ──────────────────────────────────────────────────────────────

  async listPipelines(
    projectId: string | number,
    params?: {
      status?: string;
      ref?: string;
      sha?: string;
      per_page?: number;
      page?: number;
      order_by?: string;
      sort?: string;
    }
  ): Promise<GitLabPipeline[]> {
    return this.request<GitLabPipeline[]>(
      `/projects/${this.encodeProjectId(projectId)}/pipelines`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }

  async getPipeline(
    projectId: string | number,
    pipelineId: number
  ): Promise<GitLabPipeline> {
    return this.request<GitLabPipeline>(
      `/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}`
    );
  }

  async createPipeline(
    projectId: string | number,
    ref: string,
    variables?: Array<{ key: string; value: string }>
  ): Promise<GitLabPipeline> {
    return this.request<GitLabPipeline>(
      `/projects/${this.encodeProjectId(projectId)}/pipeline`,
      { method: "POST", body: { ref, variables } }
    );
  }

  async retryPipeline(
    projectId: string | number,
    pipelineId: number
  ): Promise<GitLabPipeline> {
    return this.request<GitLabPipeline>(
      `/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}/retry`,
      { method: "POST" }
    );
  }

  async cancelPipeline(
    projectId: string | number,
    pipelineId: number
  ): Promise<GitLabPipeline> {
    return this.request<GitLabPipeline>(
      `/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}/cancel`,
      { method: "POST" }
    );
  }

  async listPipelineJobs(
    projectId: string | number,
    pipelineId: number
  ): Promise<GitLabJob[]> {
    return this.request<GitLabJob[]>(
      `/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}/jobs`
    );
  }

  async getJobLog(
    projectId: string | number,
    jobId: number
  ): Promise<string> {
    const url = new URL(
      `${this.baseUrl}/api/v4/projects/${this.encodeProjectId(projectId)}/jobs/${jobId}/trace`
    );
    const response = await fetch(url.toString(), {
      headers: { "PRIVATE-TOKEN": this.token },
    });
    if (!response.ok) {
      throw new Error(`GitLab API error ${response.status}: ${response.statusText}`);
    }
    return response.text();
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  async getCurrentUser(): Promise<GitLabUser & { email: string }> {
    return this.request<GitLabUser & { email: string }>("/user");
  }

  async listProjectMembers(
    projectId: string | number,
    params?: { search?: string; per_page?: number; page?: number }
  ): Promise<Array<GitLabUser & { access_level: number; expires_at: string | null }>> {
    return this.request(
      `/projects/${this.encodeProjectId(projectId)}/members`,
      { params: params as Record<string, string | number | boolean | undefined> }
    );
  }
}
