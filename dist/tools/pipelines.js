import { z } from "zod";
export const pipelineTools = (client) => [
    {
        name: "gitlab_list_pipelines",
        description: "List CI/CD pipelines for a GitLab project.",
        inputSchema: z.object({
            project_id: z
                .union([z.string(), z.number()])
                .describe("Project ID or URL-encoded path"),
            status: z
                .enum([
                "created",
                "waiting_for_resource",
                "preparing",
                "pending",
                "running",
                "success",
                "failed",
                "canceled",
                "skipped",
                "blocked",
                "scheduled",
            ])
                .optional()
                .describe("Filter by pipeline status"),
            ref: z.string().optional().describe("Filter by branch or tag name"),
            sha: z.string().optional().describe("Filter by commit SHA"),
            per_page: z.number().optional().describe("Items per page (max 100)"),
            page: z.number().optional().describe("Page number"),
            order_by: z
                .enum(["id", "status", "ref", "updated_at", "user_id"])
                .optional()
                .describe("Order by field"),
            sort: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
        }),
        handler: async (input) => {
            return client.listPipelines(input.project_id, {
                status: input.status,
                ref: input.ref,
                sha: input.sha,
                per_page: input.per_page,
                page: input.page,
                order_by: input.order_by,
                sort: input.sort,
            });
        },
    },
    {
        name: "gitlab_get_pipeline",
        description: "Get details of a specific CI/CD pipeline.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            pipeline_id: z.number().describe("Pipeline ID"),
        }),
        handler: async (input) => {
            return client.getPipeline(input.project_id, input.pipeline_id);
        },
    },
    {
        name: "gitlab_create_pipeline",
        description: "Trigger a new CI/CD pipeline for a branch or tag.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            ref: z.string().describe("Branch or tag to run the pipeline on"),
            variables: z
                .array(z.object({
                key: z.string().describe("Variable name"),
                value: z.string().describe("Variable value"),
            }))
                .optional()
                .describe("Pipeline variables to pass"),
        }),
        handler: async (input) => {
            return client.createPipeline(input.project_id, input.ref, input.variables);
        },
    },
    {
        name: "gitlab_retry_pipeline",
        description: "Retry all failed jobs in a CI/CD pipeline.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            pipeline_id: z.number().describe("Pipeline ID to retry"),
        }),
        handler: async (input) => {
            return client.retryPipeline(input.project_id, input.pipeline_id);
        },
    },
    {
        name: "gitlab_cancel_pipeline",
        description: "Cancel a running CI/CD pipeline.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            pipeline_id: z.number().describe("Pipeline ID to cancel"),
        }),
        handler: async (input) => {
            return client.cancelPipeline(input.project_id, input.pipeline_id);
        },
    },
    {
        name: "gitlab_list_pipeline_jobs",
        description: "List all jobs in a CI/CD pipeline.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            pipeline_id: z.number().describe("Pipeline ID"),
        }),
        handler: async (input) => {
            return client.listPipelineJobs(input.project_id, input.pipeline_id);
        },
    },
    {
        name: "gitlab_get_job_log",
        description: "Get the console output (log) of a CI/CD job. Useful for debugging failed jobs.",
        inputSchema: z.object({
            project_id: z.union([z.string(), z.number()]).describe("Project ID or path"),
            job_id: z.number().describe("Job ID"),
        }),
        handler: async (input) => {
            const log = await client.getJobLog(input.project_id, input.job_id);
            return { log };
        },
    },
];
//# sourceMappingURL=pipelines.js.map