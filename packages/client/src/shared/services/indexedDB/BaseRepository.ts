import { DB_CONFIG, type EntityType } from "./config";

export abstract class BaseRepository<T> {
  protected dbName = DB_CONFIG.name;
  protected version = DB_CONFIG.version;
  protected abstract storeName: EntityType;

  protected async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        Object.entries(DB_CONFIG.stores).forEach(([storeName, keyPath]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: "id",
              autoIncrement: true,
            });

            keyPath.forEach((index) => {
              store.createIndex(index.trim(), index.trim(), {
                unique: false,
              });
            });
          }
        });
      };
    });
  }

  protected async executeTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest
  ): Promise<T> {
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => {
        console.log("Успех");
        resolve(request.result);
      };
      request.onerror = () => {
        console.log("Ошибка");
        reject(request.error);
      };
    });
  }
}
