import { v4 as uuidv4 } from "uuid";
import { DB_CONFIG } from "./config";

interface IndexedDBOptions {
  tableName: string;
  dbName?: string;
  dbVersion?: number;
}

export interface BaseEntity {
  id: string | null;
  localId: string;
  createdAt: string;
  updatedAt: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class IndexedDB<TEntity extends BaseEntity> {
  protected tableName: string;
  protected dbName: string;
  protected dbVersion: number;

  constructor({ tableName, dbName, dbVersion }: IndexedDBOptions) {
    this.tableName = tableName;
    this.dbName = dbName || DB_CONFIG.name;
    this.dbVersion = dbVersion || DB_CONFIG.version;
  }

  async getByLocalId(id: TEntity["localId"]): Promise<TEntity | null> {
    try {
      if (!id) {
        return null;
      }

      return this.executeTransaction("readonly", (store) => store.get(id));
    } catch (error) {
      console.error(`Error getting record by id ${id}:`, error);
      return null;
    }
  }

  async getAll(): Promise<TEntity[]> {
    try {
      const result = await this.executeTransaction<TEntity[]>(
        "readonly",
        (store) => store.getAll()
      );

      return result;
    } catch (error) {
      console.error("Error getting all records:", error);
      return [];
    }
  }

  async create<
    TCreateData extends Omit<
      TEntity,
      "id" | "localId" | "createdAt" | "updatedAt"
    >
  >(createData: TCreateData): Promise<TEntity | null> {
    const newEntity = {
      ...createData,
      id: null,
      localId: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    try {
      await this.executeTransaction("readwrite", (store) =>
        store.add(newEntity)
      );

      return newEntity as unknown as TEntity;
    } catch (error) {
      console.error("Error creating record:", error);
      return null;
    }
  }

  async update<UpdateData extends Partial<TEntity> & Pick<TEntity, "localId">>(
    updateData: UpdateData
  ): Promise<TEntity | null> {
    try {
      const existingRecord = await this.getByLocalId(updateData.localId);

      if (!existingRecord) {
        throw new Error(`Record with id ${updateData.localId} not found`);
      }

      const mergedRecord = {
        ...existingRecord,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await this.executeTransaction("readwrite", (store) =>
        store.put(mergedRecord)
      );

      return mergedRecord;
    } catch (error) {
      console.error(`Error updating record ${updateData.localId}:`, error);
      return null;
    }
  }

  async clear() {
    const db = await this.getDatabaseInstance();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.tableName], "readwrite");
      const store = tx.objectStore(this.tableName);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteByLocalId(localId: TEntity["localId"]): Promise<boolean> {
    try {
      const originalRecord = await this.getByLocalId(localId);

      if (!originalRecord) {
        throw new Error(`Record not found for deletion`);
      }

      await this.executeTransaction("readwrite", (store) =>
        store.delete(localId)
      );

      return true;
    } catch (error) {
      console.error(`Error deleting record ${localId}:`, error);
      return false;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.executeTransaction<number>("readonly", (store) =>
        store.count()
      );
    } catch (error) {
      console.error("Error counting records:", error);
      return 0;
    }
  }

  async transaction<U>(
    operation: (store: IDBObjectStore) => IDBRequest<U>
  ): Promise<U> {
    return this.executeTransaction("readwrite", operation);
  }

  async isRecordExists(recordId: TEntity["localId"]): Promise<boolean> {
    const record = await this.getByLocalId(recordId);
    return !!record;
  }

  async close(): Promise<void> {
    const db = await this.getDatabaseInstance();
    db.close();
  }

  async getDatabaseInstance(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onblocked = () => {
        // Срабатывает когда есть открытые соединения со старой версией БД и нельзя выполнить обновление.
        console.warn("Database upgrade blocked by older version");
      };
      request.onupgradeneeded = (event) => {
        console.warn("onupgradeneeded");
        // Это событие срабатывает когда:

        // 1) База данных создается впервые
        // 2) Увеличивается версия базы данных (dbVersion)
        // 3) Базы данных еще не существует

        // Возвращает объект IDBDatabase (открытую базу)
        const db = (event.target as IDBOpenDBRequest).result;

        // Создание object stores (таблиц)
        Object.entries(DB_CONFIG.stores).forEach(([storeName, keyPath]) => {
          // db.objectStoreNames - это коллекция имен всех существующих таблиц в БД
          // Проверяем, не создана ли уже такая таблица.
          if (!db.objectStoreNames.contains(storeName)) {
            // Создаем таблицу
            const store = db.createObjectStore(storeName, {
              keyPath: "localId",
            });

            // Создание индексов
            keyPath.forEach((key) => {
              store.createIndex(key.trim(), key.trim(), {
                unique: false,
              });
            });
          }
        });
      };
    });
  }

  async executeTransaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    const db = await this.getDatabaseInstance();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.tableName], mode);
      const store = transaction.objectStore(this.tableName);
      const request = operation(store);

      request.onsuccess = () => {
        console.log("✅ Transaction success");
        resolve(request.result);
      };

      request.onerror = () => {
        console.log("⚠️ Transaction error");
        reject(request.error);
      };
    });
  }
}
