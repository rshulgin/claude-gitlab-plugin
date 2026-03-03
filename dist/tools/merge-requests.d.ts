import { z } from "zod";
import { GitLabClient } from "../gitlab-client.js";
export declare const mergeRequestTools: (client: GitLabClient) => ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        state: z.ZodOptional<z.ZodEnum<["opened", "closed", "merged", "all"]>>;
        labels: z.ZodOptional<z.ZodString>;
        milestone: z.ZodOptional<z.ZodString>;
        source_branch: z.ZodOptional<z.ZodString>;
        target_branch: z.ZodOptional<z.ZodString>;
        assignee_username: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
        order_by: z.ZodOptional<z.ZodEnum<["created_at", "updated_at"]>>;
        sort: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        search?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "created_at" | "updated_at" | undefined;
        sort?: "asc" | "desc" | undefined;
        state?: "opened" | "closed" | "all" | "merged" | undefined;
        labels?: string | undefined;
        milestone?: string | undefined;
        assignee_username?: string | undefined;
        source_branch?: string | undefined;
        target_branch?: string | undefined;
    }, {
        project_id: string | number;
        search?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "created_at" | "updated_at" | undefined;
        sort?: "asc" | "desc" | undefined;
        state?: "opened" | "closed" | "all" | "merged" | undefined;
        labels?: string | undefined;
        milestone?: string | undefined;
        assignee_username?: string | undefined;
        source_branch?: string | undefined;
        target_branch?: string | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        state?: string;
        labels?: string;
        milestone?: string;
        source_branch?: string;
        target_branch?: string;
        assignee_username?: string;
        search?: string;
        per_page?: number;
        page?: number;
        order_by?: string;
        sort?: string;
    }) => Promise<import("../gitlab-client.js").GitLabMergeRequest[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        mr_iid: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        mr_iid: number;
    }, {
        project_id: string | number;
        mr_iid: number;
    }>;
    handler: (input: {
        project_id: string | number;
        mr_iid: number;
    }) => Promise<import("../gitlab-client.js").GitLabMergeRequest>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        source_branch: z.ZodString;
        target_branch: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        assignee_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        labels: z.ZodOptional<z.ZodString>;
        milestone_id: z.ZodOptional<z.ZodNumber>;
        remove_source_branch: z.ZodOptional<z.ZodBoolean>;
        squash: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        title: string;
        source_branch: string;
        target_branch: string;
        labels?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
        remove_source_branch?: boolean | undefined;
        squash?: boolean | undefined;
    }, {
        project_id: string | number;
        title: string;
        source_branch: string;
        target_branch: string;
        labels?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
        remove_source_branch?: boolean | undefined;
        squash?: boolean | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        source_branch: string;
        target_branch: string;
        title: string;
        description?: string;
        assignee_ids?: number[];
        labels?: string;
        milestone_id?: number;
        remove_source_branch?: boolean;
        squash?: boolean;
    }) => Promise<import("../gitlab-client.js").GitLabMergeRequest>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        mr_iid: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        state_event: z.ZodOptional<z.ZodEnum<["close", "reopen"]>>;
        assignee_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        labels: z.ZodOptional<z.ZodString>;
        milestone_id: z.ZodOptional<z.ZodNumber>;
        target_branch: z.ZodOptional<z.ZodString>;
        remove_source_branch: z.ZodOptional<z.ZodBoolean>;
        squash: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        mr_iid: number;
        labels?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
        state_event?: "close" | "reopen" | undefined;
        target_branch?: string | undefined;
        remove_source_branch?: boolean | undefined;
        squash?: boolean | undefined;
    }, {
        project_id: string | number;
        mr_iid: number;
        labels?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
        state_event?: "close" | "reopen" | undefined;
        target_branch?: string | undefined;
        remove_source_branch?: boolean | undefined;
        squash?: boolean | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        mr_iid: number;
        title?: string;
        description?: string;
        state_event?: "close" | "reopen";
        assignee_ids?: number[];
        labels?: string;
        milestone_id?: number;
        target_branch?: string;
        remove_source_branch?: boolean;
        squash?: boolean;
    }) => Promise<import("../gitlab-client.js").GitLabMergeRequest>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        mr_iid: z.ZodNumber;
        merge_commit_message: z.ZodOptional<z.ZodString>;
        squash: z.ZodOptional<z.ZodBoolean>;
        should_remove_source_branch: z.ZodOptional<z.ZodBoolean>;
        merge_when_pipeline_succeeds: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        mr_iid: number;
        squash?: boolean | undefined;
        merge_commit_message?: string | undefined;
        should_remove_source_branch?: boolean | undefined;
        merge_when_pipeline_succeeds?: boolean | undefined;
    }, {
        project_id: string | number;
        mr_iid: number;
        squash?: boolean | undefined;
        merge_commit_message?: string | undefined;
        should_remove_source_branch?: boolean | undefined;
        merge_when_pipeline_succeeds?: boolean | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        mr_iid: number;
        merge_commit_message?: string;
        squash?: boolean;
        should_remove_source_branch?: boolean;
        merge_when_pipeline_succeeds?: boolean;
    }) => Promise<import("../gitlab-client.js").GitLabMergeRequest>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        mr_iid: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        mr_iid: number;
    }, {
        project_id: string | number;
        mr_iid: number;
    }>;
    handler: (input: {
        project_id: string | number;
        mr_iid: number;
    }) => Promise<{
        old_path: string;
        new_path: string;
        diff: string;
        new_file: boolean;
        renamed_file: boolean;
        deleted_file: boolean;
    }[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        mr_iid: z.ZodNumber;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        mr_iid: number;
        per_page?: number | undefined;
        page?: number | undefined;
    }, {
        project_id: string | number;
        mr_iid: number;
        per_page?: number | undefined;
        page?: number | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        mr_iid: number;
        per_page?: number;
        page?: number;
    }) => Promise<import("../gitlab-client.js").GitLabNote[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        mr_iid: z.ZodNumber;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        body: string;
        project_id: string | number;
        mr_iid: number;
    }, {
        body: string;
        project_id: string | number;
        mr_iid: number;
    }>;
    handler: (input: {
        project_id: string | number;
        mr_iid: number;
        body: string;
    }) => Promise<import("../gitlab-client.js").GitLabNote>;
})[];
//# sourceMappingURL=merge-requests.d.ts.map