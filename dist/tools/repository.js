import { z } from "zod";
export const repositoryTools = (client) => [
    {
        name: "gitlab_get_file",
        description: "Read the contents of a file in a GitLab repository. Returns decoded file content.",
        inputSchema: z.object({
            project_id: z
                .union([z.string(), z.number()])
                .describe("Project ID or URL-encoded path (e.g. 'group/repo')"),
            file_path: z.string().describe("Path to the file within the repository"),
            ref: z
                .string()
                .optional()
                .describe("Branch, tag, or commit SHA (default: HEAD)"),
        }),
        handler: async (input) => {
            const file = await client.getFile(input.project_id, input.file_path, input.ref);
            const content = file.encoding === "base64"
                ? Buffer.from(file.content, "base64").toString("utf-8")
                : file.content;
            return {
                file_path: file.file_path,
                file_name: file.file_name,
                size: file.size,
                ref: file.ref,
                last_commit_id: file.last_commit_id,
                content,
            };
        },
    },
    {
        name: "gitlab_list_tree",
        description: "List files and directories in a GitLab repository directory.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            path: z
                .string()
                .optional()
                .describe("Directory path (empty for root)"),
            ref: z.string().optional().describe("Branch, tag, or commit SHA"),
            recursive: z
                .boolean()
                .optional()
                .describe("List directory tree recursively"),
            per_page: z.number().optional().describe("Items per page (max 100)"),
            page: z.number().optional().describe("Page number"),
        }),
        handler: async (input) => {
            return client.listTree(input.project_id, {
                path: input.path,
                ref: input.ref,
                recursive: input.recursive,
                per_page: input.per_page,
                page: input.page,
            });
        },
    },
    {
        name: "gitlab_list_branches",
        description: "List branches in a GitLab repository.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            search: z.string().optional().describe("Filter branches by name"),
            per_page: z.number().optional().describe("Items per page"),
            page: z.number().optional().describe("Page number"),
        }),
        handler: async (input) => {
            return client.listBranches(input.project_id, {
                search: input.search,
                per_page: input.per_page,
                page: input.page,
            });
        },
    },
    {
        name: "gitlab_create_branch",
        description: "Create a new branch in a GitLab repository.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            branch: z.string().describe("Name for the new branch"),
            ref: z
                .string()
                .describe("Branch, tag, or commit SHA to branch from"),
        }),
        handler: async (input) => {
            return client.createBranch(input.project_id, input.branch, input.ref);
        },
    },
    {
        name: "gitlab_list_commits",
        description: "List commits in a GitLab repository.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            ref_name: z.string().optional().describe("Branch, tag, or commit SHA"),
            since: z
                .string()
                .optional()
                .describe("ISO 8601 date — only commits after this date"),
            until: z
                .string()
                .optional()
                .describe("ISO 8601 date — only commits before this date"),
            path: z
                .string()
                .optional()
                .describe("File path — only commits touching this file"),
            per_page: z.number().optional().describe("Items per page"),
            page: z.number().optional().describe("Page number"),
        }),
        handler: async (input) => {
            return client.listCommits(input.project_id, {
                ref_name: input.ref_name,
                since: input.since,
                until: input.until,
                path: input.path,
                per_page: input.per_page,
                page: input.page,
            });
        },
    },
    {
        name: "gitlab_get_commit",
        description: "Get details of a specific commit including file change stats.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            sha: z.string().describe("Commit SHA"),
        }),
        handler: async (input) => {
            return client.getCommit(input.project_id, input.sha);
        },
    },
    {
        name: "gitlab_search_code",
        description: "Search for code within a GitLab project. Returns file snippets matching the query.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            query: z.string().describe("Search query string"),
            ref: z
                .string()
                .optional()
                .describe("Branch or tag to search in (default: default branch)"),
        }),
        handler: async (input) => {
            return client.searchCode(input.project_id, input.query, input.ref);
        },
    },
    {
        name: "gitlab_create_file",
        description: "Create a new file in a GitLab repository.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            file_path: z.string().describe("Path for the new file"),
            branch: z.string().describe("Branch to commit to"),
            content: z.string().describe("File content"),
            commit_message: z.string().describe("Commit message"),
        }),
        handler: async (input) => {
            return client.createFile(input.project_id, input.file_path, {
                branch: input.branch,
                content: input.content,
                commit_message: input.commit_message,
            });
        },
    },
    {
        name: "gitlab_update_file",
        description: "Update an existing file in a GitLab repository.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            file_path: z.string().describe("Path to the file"),
            branch: z.string().describe("Branch to commit to"),
            content: z.string().describe("New file content"),
            commit_message: z.string().describe("Commit message"),
            last_commit_id: z
                .string()
                .optional()
                .describe("Last known commit ID (for conflict detection)"),
        }),
        handler: async (input) => {
            return client.updateFile(input.project_id, input.file_path, {
                branch: input.branch,
                content: input.content,
                commit_message: input.commit_message,
                last_commit_id: input.last_commit_id,
            });
        },
    },
    {
        name: "gitlab_compare_refs",
        description: "Compare two branches, tags, or commits. Returns diff and list of commits between them.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            from: z.string().describe("Source branch, tag, or commit SHA"),
            to: z.string().describe("Target branch, tag, or commit SHA"),
        }),
        handler: async (input) => {
            return client.compareRefs(input.project_id, input.from, input.to);
        },
    },
];
//# sourceMappingURL=repository.js.map