import { z } from "zod";
import { GitLabClient } from "../gitlab-client.js";
export declare const repositoryTools: (client: GitLabClient) => ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        file_path: z.ZodString;
        ref: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        file_path: string;
        ref?: string | undefined;
    }, {
        project_id: string | number;
        file_path: string;
        ref?: string | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        file_path: string;
        ref?: string;
    }) => Promise<{
        file_path: string;
        file_name: string;
        size: number;
        ref: string;
        last_commit_id: string;
        content: string;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        path: z.ZodOptional<z.ZodString>;
        ref: z.ZodOptional<z.ZodString>;
        recursive: z.ZodOptional<z.ZodBoolean>;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        ref?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        path?: string | undefined;
        recursive?: boolean | undefined;
    }, {
        project_id: string | number;
        ref?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        path?: string | undefined;
        recursive?: boolean | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        path?: string;
        ref?: string;
        recursive?: boolean;
        per_page?: number;
        page?: number;
    }) => Promise<import("../gitlab-client.js").GitLabTreeItem[]>;
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
    }) => Promise<import("../gitlab-client.js").GitLabBranch[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        branch: z.ZodString;
        ref: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        ref: string;
        project_id: string | number;
        branch: string;
    }, {
        ref: string;
        project_id: string | number;
        branch: string;
    }>;
    handler: (input: {
        project_id: string | number;
        branch: string;
        ref: string;
    }) => Promise<import("../gitlab-client.js").GitLabBranch>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        ref_name: z.ZodOptional<z.ZodString>;
        since: z.ZodOptional<z.ZodString>;
        until: z.ZodOptional<z.ZodString>;
        path: z.ZodOptional<z.ZodString>;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        per_page?: number | undefined;
        page?: number | undefined;
        path?: string | undefined;
        ref_name?: string | undefined;
        since?: string | undefined;
        until?: string | undefined;
    }, {
        project_id: string | number;
        per_page?: number | undefined;
        page?: number | undefined;
        path?: string | undefined;
        ref_name?: string | undefined;
        since?: string | undefined;
        until?: string | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        ref_name?: string;
        since?: string;
        until?: string;
        path?: string;
        per_page?: number;
        page?: number;
    }) => Promise<import("../gitlab-client.js").GitLabCommit[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        sha: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        sha: string;
    }, {
        project_id: string | number;
        sha: string;
    }>;
    handler: (input: {
        project_id: string | number;
        sha: string;
    }) => Promise<import("../gitlab-client.js").GitLabCommit>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        query: z.ZodString;
        ref: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        query: string;
        ref?: string | undefined;
    }, {
        project_id: string | number;
        query: string;
        ref?: string | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        query: string;
        ref?: string;
    }) => Promise<import("../gitlab-client.js").GitLabSearchResult[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        file_path: z.ZodString;
        branch: z.ZodString;
        content: z.ZodString;
        commit_message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        file_path: string;
        branch: string;
        content: string;
        commit_message: string;
    }, {
        project_id: string | number;
        file_path: string;
        branch: string;
        content: string;
        commit_message: string;
    }>;
    handler: (input: {
        project_id: string | number;
        file_path: string;
        branch: string;
        content: string;
        commit_message: string;
    }) => Promise<{
        file_path: string;
        branch: string;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        file_path: z.ZodString;
        branch: z.ZodString;
        content: z.ZodString;
        commit_message: z.ZodString;
        last_commit_id: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        file_path: string;
        branch: string;
        content: string;
        commit_message: string;
        last_commit_id?: string | undefined;
    }, {
        project_id: string | number;
        file_path: string;
        branch: string;
        content: string;
        commit_message: string;
        last_commit_id?: string | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        file_path: string;
        branch: string;
        content: string;
        commit_message: string;
        last_commit_id?: string;
    }) => Promise<{
        file_path: string;
        branch: string;
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        from: z.ZodString;
        to: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        from: string;
        to: string;
        project_id: string | number;
    }, {
        from: string;
        to: string;
        project_id: string | number;
    }>;
    handler: (input: {
        project_id: string | number;
        from: string;
        to: string;
    }) => Promise<{
        commit: import("../gitlab-client.js").GitLabCommit;
        commits: import("../gitlab-client.js").GitLabCommit[];
        diffs: Array<{
            old_path: string;
            new_path: string;
            diff: string;
            new_file: boolean;
            renamed_file: boolean;
            deleted_file: boolean;
        }>;
    }>;
})[];
//# sourceMappingURL=repository.d.ts.map