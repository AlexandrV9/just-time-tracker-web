import type {
  CreateOperation,
  CreateOperationData,
  DeleteOperation,
  DeleteOperationData,
  UpdateOperation,
  UpdateOperationData,
} from "./types";

export class OperationFactory<TData = unknown> {
  createCreateOperation(
    operationData: CreateOperationData<TData>
  ): CreateOperation<TData> {
    return {
      id: null,
      localId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
      ...operationData,
    };
  }

  createUpdateOperation(
    operationData: UpdateOperationData<TData>
  ): UpdateOperation<TData> {
    return {
      id: null,
      localId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
      ...operationData,
    };
  }

  createDeleteOperation(
    operationData: DeleteOperationData<TData>
  ): DeleteOperation<TData> {
    return {
      id: null,
      localId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: "pending",
      ...operationData,
    };
  }
}

export * from "./types";
