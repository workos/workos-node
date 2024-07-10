import { Warrant, PolicyContext, WarrantResponse } from "./warrant.interface";
import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { GetOptions } from "../../common/interfaces";

export interface QueryOptions extends PaginationOptions {
    q: string;
    context?: PolicyContext;
}

export interface SerializedQueryOptions extends PaginationOptions {
    q: string;
    context?: string;
}

export interface QueryResult {
    objectType: string;
    objectId: string;
    relation: string;
    warrant: Warrant;
    isImplicit: boolean;
    meta?: { [key: string]: any; };
}

export interface QueryResultResponse {
    object_type: string;
    object_id: string;
    relation: string;
    warrant: WarrantResponse;
    is_implicit: boolean;
    meta?: { [key: string]: any; };
}

export type QueryRequestOptions = Pick<
    GetOptions,
    'warrantToken'
>;
