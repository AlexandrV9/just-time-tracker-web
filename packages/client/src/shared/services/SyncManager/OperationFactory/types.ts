import type { BaseOperation } from "../types";

export interface CreateOperation<TData = unknown> extends BaseOperation<TData> {
  type: "CREATE";
  data: TData;
}

export interface UpdateOperation<TData = unknown> extends BaseOperation<TData> {
  type: "UPDATE";
  data: TData;
}

export interface DeleteOperation<TData = unknown> extends BaseOperation<TData> {
  type: "DELETE";
  data: TData;
}

export type Operation<TData = unknown> =
  | CreateOperation<TData>
  | UpdateOperation<TData>
  | DeleteOperation<TData>;

export type CreateOperationData<TData = unknown> = Omit<
  CreateOperation<TData>,
  "id" | "localId" | "createdAt" | "updatedAt" | "syncStatus"
>;

export type UpdateOperationData<TData = unknown> = Omit<
  UpdateOperation<TData>,
  "id" | "localId" | "createdAt" | "updatedAt" | "syncStatus"
>;

export type DeleteOperationData<TData = unknown> = Omit<
  DeleteOperation<TData>,
  "id" | "localId" | "createdAt" | "updatedAt" | "syncStatus"
>;

export type OperationData<TData = unknown> =
  | CreateOperationData<TData>
  | UpdateOperationData<TData>
  | DeleteOperationData<TData>;
