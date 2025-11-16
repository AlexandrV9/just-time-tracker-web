import type { EventBus } from "../../EventBus";

// types/network.ts
export interface NetworkEvents {
  NETWORK_CHANGE: { isOnline: boolean };
  NETWORK_ONLINE: void;
  NETWORK_OFFLINE: void;
}

export type NetworkMonitorOptions = {
  eventBus: EventBus<NetworkEvents>;
};

export class NetworkMonitor {
  private _isOnline: boolean;
  private eventBus: EventBus<NetworkEvents>;

  constructor({ eventBus }: NetworkMonitorOptions) {
    this.eventBus = eventBus;
    this._isOnline =
      typeof navigator !== "undefined" ? navigator.onLine : false;

    this.setupEventListeners();
  }

  get isOnline(): boolean {
    return this._isOnline;
  }

  private setupEventListeners(): void {
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);
  }

  private cleanupEventListeners(): void {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  }

  private handleOnline = (): void => {
    if (this._isOnline) return;

    this._isOnline = true;

    // Отправляем события через EventBus
    this.eventBus.emit("NETWORK_CHANGE", { isOnline: true });
    this.eventBus.emit("NETWORK_ONLINE", undefined);

    console.log("🌐 Network online");
  };

  private handleOffline = (): void => {
    if (!this._isOnline) return;

    this._isOnline = false;

    // Отправляем события через EventBus
    this.eventBus.emit("NETWORK_CHANGE", { isOnline: false });
    this.eventBus.emit("NETWORK_OFFLINE", undefined);

    console.log("❌ Network offline");
  };

  // Удобные методы для подписки (опционально)
  onNetworkChange(
    callback: (payload: { isOnline: boolean }) => void
  ): () => void {
    return this.eventBus.on("NETWORK_CHANGE", callback);
  }

  onOnline(callback: () => void): () => void {
    return this.eventBus.on("NETWORK_ONLINE", callback);
  }

  onOffline(callback: () => void): () => void {
    return this.eventBus.on("NETWORK_OFFLINE", callback);
  }

  // Для тестирования
  simulateOnlineStatus(online: boolean): void {
    if (this._isOnline !== online) {
      this._isOnline = online;

      if (online) {
        this.eventBus.emit("NETWORK_ONLINE", undefined);
      } else {
        this.eventBus.emit("NETWORK_OFFLINE", undefined);
      }
      this.eventBus.emit("NETWORK_CHANGE", { isOnline: online });
    }
  }

  destroy(): void {
    this.cleanupEventListeners();
  }
}
