export type Listener<T = unknown> = (data: T) => void;

export class EventBus<TEvents = Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Map<keyof TEvents, Listener<any>[]>;

  constructor() {
    this.listeners = new Map();
  }

  emit<TEvent extends keyof TEvents>(
    event: TEvent,
    payload?: TEvents[TEvent]
  ): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((callback) => callback(payload));
  }

  on<TEvent extends keyof TEvents>(
    event: TEvent,
    callback: Listener<TEvents[TEvent]>
  ): () => void {
    if (!this.isHasEvent(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(callback);

    return () => this.off(event, callback);
  }

  off<TEvent extends keyof TEvents>(
    event: TEvent,
    callback: Listener<TEvents[TEvent]>
  ): void {
    if (!this.isHasEvent(event)) {
      return;
    }

    const listeners = this.listeners.get(event)!;
    const index = listeners.indexOf(callback);

    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  isHasEvent<TEvent extends keyof TEvents>(event: TEvent): boolean {
    return this.listeners.has(event);
  }
}

export const eventBus = new EventBus();
