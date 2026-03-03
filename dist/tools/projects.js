import { z } from "zod";
export const projectTools = (client) => [
    {
        name: "gitlab_list_projects",
        description: "List GitLab projects accessible by the authenticated user. Can filter by owned, membership, or search.",
        inputSchema: z.object({
            search: z
                .string()
                .optional()
                .describe("Search for projects by name"),
            owned: z
                .boolean()
                .optional()
                .describe("Only return projects owned by the authenticated user"),
            membership: z
                .boolean()
                .optional()
                .describe("Only return projects the user is a member of"),
            per_page: z.number().optional().describe("Items per page (max 100)"),
            page: z.number().optional().describe("Page number"),
            order_by: z
                .enum([
                "id",
                "name",
                "path",
                "created_at",
                "updated_at",
                "last_activity_at",
                "star_count",
            ])
                .optional()
                .describe("Order by field"),
            sort: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
        }),
        handler: async (input) => {
            return client.listProjects({
                search: input.search,
                owned: input.owned,
                membership: input.membership,
                per_page: input.per_page,
                page: input.page,
                order_by: input.order_by,
                sort: input.sort,
            });
        },
    },
    {
        name: "gitlab_get_project",
        description: "Get detailed information about a specific GitLab project, including statistics, default branch, and URLs.",
        inputSchema: z.object({
            project_id: z
                .union([z.string(), z.number()])
                .describe("Project ID (number) or URL-encoded path (e.g. 'mygroup/myrepo')"),
        }),
        handler: async (input) => {
            return client.getProject(input.project_id);
        },
    },
    {
        name: "gitlab_get_current_user",
        description: "Get information about the currently authenticated GitLab user.",
        inputSchema: z.object({}),
        handler: async (_input) => {
            return client.getCurrentUser();
        },
    },
    {
        name: "gitlab_list_project_members",
        description: "List members of a GitLab project.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            search: z.string().optional().describe("Filter members by name or username"),
            per_page: z.number().optional().describe("Items per page"),
            page: z.number().optional().describe("Page number"),
        }),
        handler: async (input) => {
            return client.listProjectMembers(input.project_id, {
                search: input.search,
                per_page: input.per_page,
                page: input.page,
            });
        },
    },
];
//# sourceMappingURL=projects.js.map