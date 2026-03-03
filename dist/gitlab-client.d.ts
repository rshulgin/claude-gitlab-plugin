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
export declare class GitLabClient {
    private baseUrl;
    private token;
    constructor(config: GitLabConfig);
    private request;
    private encodeProjectId;
    listProjects(params?: {
        search?: string;
        owned?: boolean;
        membership?: boolean;
        per_page?: number;
        page?: number;
        order_by?: string;
        sort?: string;
    }): Promise<GitLabProject[]>;
    getProject(projectId: string | number): Promise<GitLabProject>;
    getFile(projectId: string | number, filePath: string, ref?: string): Promise<GitLabFile>;
    listTree(projectId: string | number, params?: {
        path?: string;
        ref?: string;
        recursive?: boolean;
        per_page?: number;
        page?: number;
    }): Promise<GitLabTreeItem[]>;
    listCommits(projectId: string | number, params?: {
        ref_name?: string;
        since?: string;
        until?: string;
        path?: string;
        per_page?: number;
        page?: number;
    }): Promise<GitLabCommit[]>;
    getCommit(projectId: string | number, sha: string): Promise<GitLabCommit>;
    listBranches(projectId: string | number, params?: {
        search?: string;
        per_page?: number;
        page?: number;
    }): Promise<GitLabBranch[]>;
    createBranch(projectId: string | number, branch: string, ref: string): Promise<GitLabBranch>;
    createFile(projectId: string | number, filePath: string, params: {
        branch: string;
        content: string;
        commit_message: string;
        encoding?: string;
    }): Promise<{
        file_path: string;
        branch: string;
    }>;
    updateFile(projectId: string | number, filePath: string, params: {
        branch: string;
        content: string;
        commit_message: string;
        last_commit_id?: string;
        encoding?: string;
    }): Promise<{
        file_path: string;
        branch: string;
    }>;
    searchCode(projectId: string | number, query: string, ref?: string): Promise<GitLabSearchResult[]>;
    compareRefs(projectId: string | number, from: string, to: string): Promise<{
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
    }>;
    listIssues(projectId: string | number, params?: {
        state?: string;
        labels?: string;
        milestone?: string;
        assignee_username?: string;
        search?: string;
        per_page?: number;
        page?: number;
        order_by?: string;
        sort?: string;
    }): Promise<GitLabIssue[]>;
    getIssue(projectId: string | number, issueIid: number): Promise<GitLabIssue>;
    createIssue(projectId: string | number, params: {
        title: string;
        description?: string;
        labels?: string;
        assignee_ids?: number[];
        milestone_id?: number;
    }): Promise<GitLabIssue>;
    updateIssue(projectId: string | number, issueIid: number, params: {
        title?: string;
        description?: string;
        state_event?: "close" | "reopen";
        labels?: string;
        assignee_ids?: number[];
        milestone_id?: number;
    }): Promise<GitLabIssue>;
    listIssueNotes(projectId: string | number, issueIid: number, params?: {
        per_page?: number;
        page?: number;
    }): Promise<GitLabNote[]>;
    createIssueNote(projectId: string | number, issueIid: number, body: string): Promise<GitLabNote>;
    listMergeRequests(projectId: string | number, params?: {
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
    }): Promise<GitLabMergeRequest[]>;
    getMergeRequest(projectId: string | number, mrIid: number): Promise<GitLabMergeRequest>;
    createMergeRequest(projectId: string | number, params: {
        source_branch: string;
        target_branch: string;
        title: string;
        description?: string;
        assignee_ids?: number[];
        labels?: string;
        milestone_id?: number;
        remove_source_branch?: boolean;
        squash?: boolean;
    }): Promise<GitLabMergeRequest>;
    updateMergeRequest(projectId: string | number, mrIid: number, params: {
        title?: string;
        description?: string;
        state_event?: "close" | "reopen";
        assignee_ids?: number[];
        labels?: string;
        milestone_id?: number;
        target_branch?: string;
        remove_source_branch?: boolean;
        squash?: boolean;
    }): Promise<GitLabMergeRequest>;
    acceptMergeRequest(projectId: string | number, mrIid: number, params?: {
        merge_commit_message?: string;
        squash_commit_message?: string;
        squash?: boolean;
        should_remove_source_branch?: boolean;
        merge_when_pipeline_succeeds?: boolean;
    }): Promise<GitLabMergeRequest>;
    getMergeRequestDiff(projectId: string | number, mrIid: number): Promise<Array<{
        old_path: string;
        new_path: string;
        diff: string;
        new_file: boolean;
        renamed_file: boolean;
        deleted_file: boolean;
    }>>;
    listMergeRequestNotes(projectId: string | number, mrIid: number, params?: {
        per_page?: number;
        page?: number;
    }): Promise<GitLabNote[]>;
    createMergeRequestNote(projectId: string | number, mrIid: number, body: string): Promise<GitLabNote>;
    listPipelines(projectId: string | number, params?: {
        status?: string;
        ref?: string;
        sha?: string;
        per_page?: number;
        page?: number;
        order_by?: string;
        sort?: string;
    }): Promise<GitLabPipeline[]>;
    getPipeline(projectId: string | number, pipelineId: number): Promise<GitLabPipeline>;
    createPipeline(projectId: string | number, ref: string, variables?: Array<{
        key: string;
        value: string;
    }>): Promise<GitLabPipeline>;
    retryPipeline(projectId: string | number, pipelineId: number): Promise<GitLabPipeline>;
    cancelPipeline(projectId: string | number, pipelineId: number): Promise<GitLabPipeline>;
    listPipelineJobs(projectId: string | number, pipelineId: number): Promise<GitLabJob[]>;
    getJobLog(projectId: string | number, jobId: number): Promise<string>;
    getCurrentUser(): Promise<GitLabUser & {
        email: string;
    }>;
    listProjectMembers(projectId: string | number, params?: {
        search?: string;
        per_page?: number;
        page?: number;
    }): Promise<Array<GitLabUser & {
        access_level: number;
        expires_at: string | null;
    }>>;
}
//# sourceMappingURL=gitlab-client.d.ts.map