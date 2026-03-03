import { z } from "zod";
export const mergeRequestTools = (client) => [
    {
        name: "gitlab_list_merge_requests",
        description: "List merge requests in a GitLab project. Supports filtering by state, source/target branch, and more.",
        inputSchema: z.object({
            project_id: z
                .union([z.string(), z.number()])
                .describe("Project ID or URL-encoded path"),
            state: z
                .enum(["opened", "closed", "merged", "all"])
                .optional()
                .describe("Filter by state"),
            labels: z
                .string()
                .optional()
                .describe("Comma-separated label names to filter by"),
            milestone: z.string().optional().describe("Filter by milestone title"),
            source_branch: z.string().optional().describe("Filter by source branch"),
            target_branch: z.string().optional().describe("Filter by target branch"),
            assignee_username: z
                .string()
                .optional()
                .describe("Filter by assignee username"),
            search: z.string().optional().describe("Search in title and description"),
            per_page: z.number().optional().describe("Items per page (max 100)"),
            page: z.number().optional().describe("Page number"),
            order_by: z
                .enum(["created_at", "updated_at"])
                .optional()
                .describe("Order by field"),
            sort: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
        }),
        handler: async (input) => {
            return client.listMergeRequests(input.project_id, {
                state: input.state,
                labels: input.labels,
                milestone: input.milestone,
                source_branch: input.source_branch,
                target_branch: input.target_branch,
                assignee_username: input.assignee_username,
                search: input.search,
                per_page: input.per_page,
                page: input.page,
                order_by: input.order_by,
                sort: input.sort,
            });
        },
    },
    {
        name: "gitlab_get_merge_request",
        description: "Get details of a specific merge request by its internal ID (IID).",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            mr_iid: z
                .number()
                .describe("Merge request internal ID (the number shown in the UI)"),
        }),
        handler: async (input) => {
            return client.getMergeRequest(input.project_id, input.mr_iid);
        },
    },
    {
        name: "gitlab_create_merge_request",
        description: "Create a new merge request in a GitLab project.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            source_branch: z.string().describe("Branch to merge from"),
            target_branch: z.string().describe("Branch to merge into"),
            title: z.string().describe("Merge request title"),
            description: z
                .string()
                .optional()
                .describe("Merge request description (Markdown)"),
            assignee_ids: z
                .array(z.number())
                .optional()
                .describe("User IDs to assign"),
            labels: z
                .string()
                .optional()
                .describe("Comma-separated label names"),
            milestone_id: z.number().optional().describe("Milestone ID"),
            remove_source_branch: z
                .boolean()
                .optional()
                .describe("Delete source branch after merge"),
            squash: z
                .boolean()
                .optional()
                .describe("Squash commits on merge"),
        }),
        handler: async (input) => {
            return client.createMergeRequest(input.project_id, {
                source_branch: input.source_branch,
                target_branch: input.target_branch,
                title: input.title,
                description: input.description,
                assignee_ids: input.assignee_ids,
                labels: input.labels,
                milestone_id: input.milestone_id,
                remove_source_branch: input.remove_source_branch,
                squash: input.squash,
            });
        },
    },
    {
        name: "gitlab_update_merge_request",
        description: "Update an existing merge request. Can change title, description, state, labels, and more.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            mr_iid: z.number().describe("Merge request internal ID"),
            title: z.string().optional().describe("New title"),
            description: z.string().optional().describe("New description"),
            state_event: z
                .enum(["close", "reopen"])
                .optional()
                .describe("Transition state"),
            assignee_ids: z
                .array(z.number())
                .optional()
                .describe("User IDs to assign (replaces existing)"),
            labels: z
                .string()
                .optional()
                .describe("Comma-separated labels (replaces existing)"),
            milestone_id: z.number().optional().describe("Milestone ID"),
            target_branch: z.string().optional().describe("Change the target branch"),
            remove_source_branch: z
                .boolean()
                .optional()
                .describe("Delete source branch after merge"),
            squash: z.boolean().optional().describe("Squash commits on merge"),
        }),
        handler: async (input) => {
            return client.updateMergeRequest(input.project_id, input.mr_iid, {
                title: input.title,
                description: input.description,
                state_event: input.state_event,
                assignee_ids: input.assignee_ids,
                labels: input.labels,
                milestone_id: input.milestone_id,
                target_branch: input.target_branch,
                remove_source_branch: input.remove_source_branch,
                squash: input.squash,
            });
        },
    },
    {
        name: "gitlab_accept_merge_request",
        description: "Accept (merge) a merge request. The MR must be in a mergeable state.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            mr_iid: z.number().describe("Merge request internal ID"),
            merge_commit_message: z
                .string()
                .optional()
                .describe("Custom merge commit message"),
            squash: z.boolean().optional().describe("Squash commits on merge"),
            should_remove_source_branch: z
                .boolean()
                .optional()
                .describe("Remove source branch after merge"),
            merge_when_pipeline_succeeds: z
                .boolean()
                .optional()
                .describe("Merge only when the pipeline succeeds"),
        }),
        handler: async (input) => {
            return client.acceptMergeRequest(input.project_id, input.mr_iid, {
                merge_commit_message: input.merge_commit_message,
                squash: input.squash,
                should_remove_source_branch: input.should_remove_source_branch,
                merge_when_pipeline_succeeds: input.merge_when_pipeline_succeeds,
            });
        },
    },
    {
        name: "gitlab_get_merge_request_diff",
        description: "Get the file diffs for a merge request.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            mr_iid: z.number().describe("Merge request internal ID"),
        }),
        handler: async (input) => {
            return client.getMergeRequestDiff(input.project_id, input.mr_iid);
        },
    },
    {
        name: "gitlab_list_mr_comments",
        description: "List comments (notes) on a GitLab merge request.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            mr_iid: z.number().describe("Merge request internal ID"),
            per_page: z.number().optional().describe("Items per page"),
            page: z.number().optional().describe("Page number"),
        }),
        handler: async (input) => {
            return client.listMergeRequestNotes(input.project_id, input.mr_iid, {
                per_page: input.per_page,
                page: input.page,
            });
        },
    },
    {
        name: "gitlab_create_mr_comment",
        description: "Add a comment to a GitLab merge request.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            mr_iid: z.number().describe("Merge request internal ID"),
            body: z.string().describe("Comment body (Markdown supported)"),
        }),
        handler: async (input) => {
            return client.createMergeRequestNote(input.project_id, input.mr_iid, input.body);
        },
    },
];
//# sourceMappingURL=merge-requests.js.map