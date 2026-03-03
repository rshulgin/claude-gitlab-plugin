import { z } from "zod";
export const issueTools = (client) => [
    {
        name: "gitlab_list_issues",
        description: "List issues in a GitLab project. Supports filtering by state, labels, assignee, and more.",
        inputSchema: z.object({
            project_id: z
                .union([z.string(), z.number()])
                .describe("Project ID or URL-encoded path"),
            state: z
                .enum(["opened", "closed", "all"])
                .optional()
                .describe("Filter by state"),
            labels: z
                .string()
                .optional()
                .describe("Comma-separated list of label names to filter by"),
            milestone: z.string().optional().describe("Filter by milestone title"),
            assignee_username: z
                .string()
                .optional()
                .describe("Filter by assignee username"),
            search: z.string().optional().describe("Search in title and description"),
            per_page: z.number().optional().describe("Items per page (max 100)"),
            page: z.number().optional().describe("Page number"),
            order_by: z
                .enum(["created_at", "updated_at", "priority", "due_date"])
                .optional()
                .describe("Order by field"),
            sort: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
        }),
        handler: async (input) => {
            return client.listIssues(input.project_id, {
                state: input.state,
                labels: input.labels,
                milestone: input.milestone,
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
        name: "gitlab_get_issue",
        description: "Get details of a specific issue by its internal ID (IID).",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            issue_iid: z
                .number()
                .describe("Issue internal ID (the number shown in the UI)"),
        }),
        handler: async (input) => {
            return client.getIssue(input.project_id, input.issue_iid);
        },
    },
    {
        name: "gitlab_create_issue",
        description: "Create a new issue in a GitLab project.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            title: z.string().describe("Issue title"),
            description: z.string().optional().describe("Issue description (Markdown)"),
            labels: z
                .string()
                .optional()
                .describe("Comma-separated list of label names"),
            assignee_ids: z
                .array(z.number())
                .optional()
                .describe("User IDs to assign"),
            milestone_id: z.number().optional().describe("Milestone ID to assign"),
        }),
        handler: async (input) => {
            return client.createIssue(input.project_id, {
                title: input.title,
                description: input.description,
                labels: input.labels,
                assignee_ids: input.assignee_ids,
                milestone_id: input.milestone_id,
            });
        },
    },
    {
        name: "gitlab_update_issue",
        description: "Update an existing issue. Can change title, description, state, labels, and more.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            issue_iid: z.number().describe("Issue internal ID"),
            title: z.string().optional().describe("New title"),
            description: z.string().optional().describe("New description"),
            state_event: z
                .enum(["close", "reopen"])
                .optional()
                .describe("Transition state"),
            labels: z
                .string()
                .optional()
                .describe("Comma-separated labels (replaces existing)"),
            assignee_ids: z
                .array(z.number())
                .optional()
                .describe("User IDs to assign (replaces existing)"),
            milestone_id: z.number().optional().describe("Milestone ID"),
        }),
        handler: async (input) => {
            return client.updateIssue(input.project_id, input.issue_iid, {
                title: input.title,
                description: input.description,
                state_event: input.state_event,
                labels: input.labels,
                assignee_ids: input.assignee_ids,
                milestone_id: input.milestone_id,
            });
        },
    },
    {
        name: "gitlab_list_issue_comments",
        description: "List comments (notes) on a GitLab issue.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            issue_iid: z.number().describe("Issue internal ID"),
            per_page: z.number().optional().describe("Items per page"),
            page: z.number().optional().describe("Page number"),
        }),
        handler: async (input) => {
            return client.listIssueNotes(input.project_id, input.issue_iid, {
                per_page: input.per_page,
                page: input.page,
            });
        },
    },
    {
        name: "gitlab_create_issue_comment",
        description: "Add a comment to a GitLab issue.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            issue_iid: z.number().describe("Issue internal ID"),
            body: z.string().describe("Comment body (Markdown supported)"),
        }),
        handler: async (input) => {
            return client.createIssueNote(input.project_id, input.issue_iid, input.body);
        },
    },
];
//# sourceMappingURL=issues.js.map