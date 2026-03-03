import { z } from "zod";
import { GitLabClient } from "../gitlab-client.js";
export declare const pipelineTools: (client: GitLabClient) => ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        status: z.ZodOptional<z.ZodEnum<["created", "waiting_for_resource", "preparing", "pending", "running", "success", "failed", "canceled", "skipped", "blocked", "scheduled"]>>;
        ref: z.ZodOptional<z.ZodString>;
        sha: z.ZodOptional<z.ZodString>;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
        order_by: z.ZodOptional<z.ZodEnum<["id", "status", "ref", "updated_at", "user_id"]>>;
        sort: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        ref?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "ref" | "id" | "updated_at" | "status" | "user_id" | undefined;
        sort?: "asc" | "desc" | undefined;
        status?: "created" | "waiting_for_resource" | "preparing" | "pending" | "running" | "success" | "failed" | "canceled" | "skipped" | "blocked" | "scheduled" | undefined;
        sha?: string | undefined;
    }, {
        project_id: string | number;
        ref?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "ref" | "id" | "updated_at" | "status" | "user_id" | undefined;
        sort?: "asc" | "desc" | undefined;
        status?: "created" | "waiting_for_resource" | "preparing" | "pending" | "running" | "success" | "failed" | "canceled" | "skipped" | "blocked" | "scheduled" | undefined;
        sha?: string | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        status?: string;
        ref?: string;
        sha?: string;
        per_page?: number;
        page?: number;
        order_by?: string;
        sort?: string;
    }) => Promise<import("../gitlab-client.js").GitLabPipeline[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        pipeline_id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        pipeline_id: number;
    }, {
        project_id: string | number;
        pipeline_id: number;
    }>;
    handler: (input: {
        project_id: string | number;
        pipeline_id: number;
    }) => Promise<import("../gitlab-client.js").GitLabPipeline>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        ref: z.ZodString;
        variables: z.ZodOptional<z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            key: string;
            value: string;
        }, {
            key: string;
            value: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        ref: string;
        project_id: string | number;
        variables?: {
            key: string;
            value: string;
        }[] | undefined;
    }, {
        ref: string;
        project_id: string | number;
        variables?: {
            key: string;
            value: string;
        }[] | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        ref: string;
        variables?: Array<{
            key: string;
            value: string;
        }>;
    }) => Promise<import("../gitlab-client.js").GitLabPipeline>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        pipeline_id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        pipeline_id: number;
    }, {
        project_id: string | number;
        pipeline_id: number;
    }>;
    handler: (input: {
        project_id: string | number;
        pipeline_id: number;
    }) => Promise<import("../gitlab-client.js").GitLabJob[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        job_id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        job_id: number;
    }, {
        project_id: string | number;
        job_id: number;
    }>;
    handler: (input: {
        project_id: string | number;
        job_id: number;
    }) => Promise<{
        log: string;
    }>;
})[];
//# sourceMappingURL=pipelines.d.ts.map