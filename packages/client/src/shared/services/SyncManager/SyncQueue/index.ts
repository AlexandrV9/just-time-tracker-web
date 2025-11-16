// 1. SyncQueue (Очередь операций)

import type { BaseOperation, OperationSyncStatusType } from "../types";
import { OperationPriority } from "./constants";

export class SyncQueue<TOperation extends BaseOperation = BaseOperation> {
  private operations: Map<TOperation["localId"], TOperation> = new Map();
  private queueOperationIds: TOperation["localId"][] = [];

  constructor() {}

  setOperations(syncOperations: TOperation[]) {
    const syncOperationsMap = new Map(
      syncOperations.map((op) => [op.localId, op])
    );

    this.operations = new Map([...this.operations, ...syncOperationsMap]);
    this.queueOperationIds = [
      ...this.operations.keys(),
      ...syncOperationsMap.keys(),
    ];
  }

  addOperation(operation: TOperation) {
    const existingOperation = this.findDublicate(operation);

    if (existingOperation) {
      // merge
    } else {
      this.operations.set(operation.localId, operation);
      this.queueOperationIds.push(operation.localId);
    }

    this.sortQueue();
  }

  getOperationByLocalId(localId: TOperation["localId"]): TOperation | null {
    return this.operations.get(localId) || null;
  }

  getNextOperation(): TOperation | null {
    if (this.queueOperationIds.length === 0) {
      return null;
    }

    const nextOperationId = this.queueOperationIds.shift();

    if (!nextOperationId) {
      return null;
    }

    const nextOperation = this.operations.get(nextOperationId);

    return nextOperation || null;
  }

  deleteOperationById(localId: TOperation["localId"]) {
    const existed = this.operations.delete(localId);

    if (existed) {
      const index = this.queueOperationIds.findIndex(
        (opId) => opId === localId
      );

      if (index > -1) {
        this.queueOperationIds.splice(index, 1);
      }
    }
  }

  mergeOperations() {
    const mergred = new Map<TOperation["localId"], TOperation>();

    for (const operation of this.operations.values()) {
      const key = this.getOperationKey(operation);

      if (mergred.has(key)) {
        // const existing = mergred.get(key);
        // mergred.set(key, this.merge(existing!, operation));
      } else {
        mergred.set(key, operation);
      }
    }

    this.operations = mergred;
    this.rebuildPriorityQueue();
  }

  getAllOperations(): TOperation[] {
    return Array.from(this.operations.values());
  }

  hasOperations(): boolean {
    return this.operations.size > 0;
  }

  getSize(): number {
    return this.operations.size;
  }

  clear(): void {
    this.operations.clear();
    this.queueOperationIds = [];
    // this.isDirty = true;
    // this.saveToStorage();
  }

  getByStatus(status: OperationSyncStatusType): TOperation[] {
    return Array.from(this.operations.values()).filter(
      (op) => op.syncStatus === status
    );
  }

  private rebuildPriorityQueue(): void {
    this.queueOperationIds = Array.from(this.operations.keys());
    this.sortQueue();
  }

  // private merge(a: Operation, b: Operation): Operation {
  //   const newPriorityValue = Math.max(
  //     OperationPriority[a.priority],
  //     OperationPriority[b.priority]
  //   );

  //   return {
  //     ...a,
  //     data: {
  //       ...a.data,
  //       ...b.data,
  //     },
  //     priority: getOperationPriorityKeyByValue(
  //       newPriorityValue as OperationPriorityValueType
  //     ),
  //     timestamp: Math.max(a.timestamp, b.timestamp),
  //   };
  // }

  private findDublicate(operation: TOperation): TOperation | null {
    const key = this.getOperationKey(operation);

    for (const existingOperation of this.operations.values()) {
      if (this.getOperationKey(existingOperation) === key) {
        return existingOperation;
      }
    }

    return null;
  }

  private getOperationKey(operation: TOperation): string {
    return `${operation.type}:${operation.entity}:${operation.localId}`;
  }

  private sortQueue(): void {
    this.queueOperationIds.sort((a_OperationId, b_OperationId) => {
      const a_Operation = this.getOperationByLocalId(a_OperationId);
      const b_Operation = this.getOperationByLocalId(b_OperationId);

      if (a_Operation === null || b_Operation === null) {
        return 0;
      }

      if (a_Operation.priority > b_Operation.priority) {
        return (
          OperationPriority[b_Operation.priority] -
          OperationPriority[a_Operation.priority]
        );
      }

      // If the priority is equal, then compare by timestamp (start - old)
      // return a.timestamp - b.timestamp;
      return -1;
    });
  }
}

export const syncQueue = new SyncQueue();
