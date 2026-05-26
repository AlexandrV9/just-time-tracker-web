import { IndexedDB } from "../../IndexedDB";
import type { BaseOperation } from "../types";

export class OperationRepository<
  TOperation extends BaseOperation = BaseOperation
> extends IndexedDB<TOperation> {
  constructor() {
    super({ tableName: "operations" });
  }
}

export const operationRepository = new OperationRepository();
