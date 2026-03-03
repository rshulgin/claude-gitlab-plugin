/**
 * GitLab API client for the Claude Code MCP connector.
 * Wraps GitLab REST API v4 endpoints.
 */
export class GitLabClient {
    baseUrl;
    token;
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, "");
        this.token = config.token;
    }
    async request(path, options = {}) {
        const { method = "GET", body, params } = options;
        const url = new URL(`${this.baseUrl}/api/v4${path}`);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        const headers = {
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
            throw new Error(`GitLab API error ${response.status} ${response.statusText}: ${errorText}`);
        }
        if (response.status === 204) {
            return {};
        }
        return response.json();
    }
    encodeProjectId(projectId) {
        if (typeof projectId === "number")
            return String(projectId);
        return encodeURIComponent(projectId);
    }
    // ── Projects ───────────────────────────────────────────────────────────────
    async listProjects(params) {
        return this.request("/projects", { params: params });
    }
    async getProject(projectId) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}`);
    }
    // ── Repository ─────────────────────────────────────────────────────────────
    async getFile(projectId, filePath, ref = "HEAD") {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/files/${encodeURIComponent(filePath)}`, { params: { ref } });
    }
    async listTree(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/tree`, { params: params });
    }
    async listCommits(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/commits`, { params: params });
    }
    async getCommit(projectId, sha) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/commits/${sha}`);
    }
    async listBranches(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/branches`, { params: params });
    }
    async createBranch(projectId, branch, ref) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/branches`, { method: "POST", body: { branch, ref } });
    }
    async createFile(projectId, filePath, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/files/${encodeURIComponent(filePath)}`, { method: "POST", body: params });
    }
    async updateFile(projectId, filePath, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/files/${encodeURIComponent(filePath)}`, { method: "PUT", body: params });
    }
    async searchCode(projectId, query, ref) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/search`, { params: { scope: "blobs", search: query, ref } });
    }
    async compareRefs(projectId, from, to) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/repository/compare`, { params: { from, to } });
    }
    // ── Issues ─────────────────────────────────────────────────────────────────
    async listIssues(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/issues`, { params: params });
    }
    async getIssue(projectId, issueIid) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}`);
    }
    async createIssue(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/issues`, { method: "POST", body: params });
    }
    async updateIssue(projectId, issueIid, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}`, { method: "PUT", body: params });
    }
    async listIssueNotes(projectId, issueIid, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}/notes`, { params: params });
    }
    async createIssueNote(projectId, issueIid, body) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/issues/${issueIid}/notes`, { method: "POST", body: { body } });
    }
    // ── Merge Requests ─────────────────────────────────────────────────────────
    async listMergeRequests(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests`, { params: params });
    }
    async getMergeRequest(projectId, mrIid) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}`);
    }
    async createMergeRequest(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests`, { method: "POST", body: params });
    }
    async updateMergeRequest(projectId, mrIid, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}`, { method: "PUT", body: params });
    }
    async acceptMergeRequest(projectId, mrIid, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/merge`, { method: "PUT", body: params });
    }
    async getMergeRequestDiff(projectId, mrIid) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/diffs`);
    }
    async listMergeRequestNotes(projectId, mrIid, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/notes`, { params: params });
    }
    async createMergeRequestNote(projectId, mrIid, body) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/merge_requests/${mrIid}/notes`, { method: "POST", body: { body } });
    }
    // ── Pipelines ──────────────────────────────────────────────────────────────
    async listPipelines(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/pipelines`, { params: params });
    }
    async getPipeline(projectId, pipelineId) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}`);
    }
    async createPipeline(projectId, ref, variables) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/pipeline`, { method: "POST", body: { ref, variables } });
    }
    async retryPipeline(projectId, pipelineId) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}/retry`, { method: "POST" });
    }
    async cancelPipeline(projectId, pipelineId) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}/cancel`, { method: "POST" });
    }
    async listPipelineJobs(projectId, pipelineId) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/pipelines/${pipelineId}/jobs`);
    }
    async getJobLog(projectId, jobId) {
        const url = new URL(`${this.baseUrl}/api/v4/projects/${this.encodeProjectId(projectId)}/jobs/${jobId}/trace`);
        const response = await fetch(url.toString(), {
            headers: { "PRIVATE-TOKEN": this.token },
        });
        if (!response.ok) {
            throw new Error(`GitLab API error ${response.status}: ${response.statusText}`);
        }
        return response.text();
    }
    // ── Users ──────────────────────────────────────────────────────────────────
    async getCurrentUser() {
        return this.request("/user");
    }
    async listProjectMembers(projectId, params) {
        return this.request(`/projects/${this.encodeProjectId(projectId)}/members`, { params: params });
    }
}
//# sourceMappingURL=gitlab-client.js.map