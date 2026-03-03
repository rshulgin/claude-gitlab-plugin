import { z } from "zod";
import { GitLabClient } from "../gitlab-client.js";
export declare const issueTools: (client: GitLabClient) => ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        state: z.ZodOptional<z.ZodEnum<["opened", "closed", "all"]>>;
        labels: z.ZodOptional<z.ZodString>;
        milestone: z.ZodOptional<z.ZodString>;
        assignee_username: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
        order_by: z.ZodOptional<z.ZodEnum<["created_at", "updated_at", "priority", "due_date"]>>;
        sort: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        search?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "created_at" | "updated_at" | "priority" | "due_date" | undefined;
        sort?: "asc" | "desc" | undefined;
        state?: "opened" | "closed" | "all" | undefined;
        labels?: string | undefined;
        milestone?: string | undefined;
        assignee_username?: string | undefined;
    }, {
        project_id: string | number;
        search?: string | undefined;
        per_page?: number | undefined;
        page?: number | undefined;
        order_by?: "created_at" | "updated_at" | "priority" | "due_date" | undefined;
        sort?: "asc" | "desc" | undefined;
        state?: "opened" | "closed" | "all" | undefined;
        labels?: string | undefined;
        milestone?: string | undefined;
        assignee_username?: string | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        state?: string;
        labels?: string;
        milestone?: string;
        assignee_username?: string;
        search?: string;
        per_page?: number;
        page?: number;
        order_by?: string;
        sort?: string;
    }) => Promise<import("../gitlab-client.js").GitLabIssue[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        issue_iid: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        issue_iid: number;
    }, {
        project_id: string | number;
        issue_iid: number;
    }>;
    handler: (input: {
        project_id: string | number;
        issue_iid: number;
    }) => Promise<import("../gitlab-client.js").GitLabIssue>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        labels: z.ZodOptional<z.ZodString>;
        assignee_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        milestone_id: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        title: string;
        labels?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
    }, {
        project_id: string | number;
        title: string;
        labels?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        title: string;
        description?: string;
        labels?: string;
        assignee_ids?: number[];
        milestone_id?: number;
    }) => Promise<import("../gitlab-client.js").GitLabIssue>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        issue_iid: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        state_event: z.ZodOptional<z.ZodEnum<["close", "reopen"]>>;
        labels: z.ZodOptional<z.ZodString>;
        assignee_ids: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        milestone_id: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        issue_iid: number;
        labels?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
        state_event?: "close" | "reopen" | undefined;
    }, {
        project_id: string | number;
        issue_iid: number;
        labels?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        assignee_ids?: number[] | undefined;
        milestone_id?: number | undefined;
        state_event?: "close" | "reopen" | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        issue_iid: number;
        title?: string;
        description?: string;
        state_event?: "close" | "reopen";
        labels?: string;
        assignee_ids?: number[];
        milestone_id?: number;
    }) => Promise<import("../gitlab-client.js").GitLabIssue>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        issue_iid: z.ZodNumber;
        per_page: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        project_id: string | number;
        issue_iid: number;
        per_page?: number | undefined;
        page?: number | undefined;
    }, {
        project_id: string | number;
        issue_iid: number;
        per_page?: number | undefined;
        page?: number | undefined;
    }>;
    handler: (input: {
        project_id: string | number;
        issue_iid: number;
        per_page?: number;
        page?: number;
    }) => Promise<import("../gitlab-client.js").GitLabNote[]>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        project_id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
        issue_iid: z.ZodNumber;
        body: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        body: string;
        project_id: string | number;
        issue_iid: number;
    }, {
        body: string;
        project_id: string | number;
        issue_iid: number;
    }>;
    handler: (input: {
        project_id: string | number;
        issue_iid: number;
        body: string;
    }) => Promise<import("../gitlab-client.js").GitLabNote>;
})[];
//# sourceMappingURL=issues.d.ts.map