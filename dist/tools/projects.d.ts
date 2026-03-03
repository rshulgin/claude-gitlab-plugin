import { z } from "zod";
import { GitLabClient } from "../gitlab-client.js";
export declare const projectTools: (client: GitLabClient) => ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        search: z.ZodOptional<z.ZodString>;
        owned: z.ZodOptional<z.ZodBoolean>;
        membership: z.ZodOptional<z.ZodBoolean>;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
        order_by: z.ZodOptional<z.ZodEnum<["id", "name", "path", "created_at", "updated_at", "last_activity_at", "star_count"]>>;
        sort: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        search?: string | undefined;
        owned?: boolean | undefined;
        membership?: boolean | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "id" | "name" | "path" | "created_at" | "updated_at" | "last_activity_at" | "star_count" | undefined;
        sort?: "asc" | "desc" | undefined;
    }, {
        search?: string | undefined;
        owned?: boolean | undefined;
        membership?: boolean | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "id" | "name" | "path" | "created_at" | "updated_at" | "last_activity_at" | "star_count" | undefined;
        sort?: "asc" | "desc" | undefined;
    }>;
    handler: (input: {
        search?: string;
        owned?: boolean;
        membership?: boolean;
        per_page?: number;
        page?: number;
        order_by?: string;
        sort?: string;
    }) => Promise<import("../gitlab-client.js").GitLabProject[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
    }, {
        project_id: string | number;
    }>;
    handler: (input: {
        project_id: string | number;
    }) => Promise<import("../gitlab-client.js").GitLabProject>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    handler: (_input: Record<string, never>) => Promise<import("../gitlab-client.js").GitLabUser & {
        email: string;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        search: z.ZodOptional<z.ZodString>;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        search?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
    }, {
        project_id: string | number;
        search?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        search?: string;
        per_page?: number;
        page?: number;
    }) => Promise<(import("../gitlab-client.js").GitLabUser & {
        access_level: number;
        expires_at: string | null;
    })[]>;
})[];
//# sourceMappingURL=projects.d.ts.map