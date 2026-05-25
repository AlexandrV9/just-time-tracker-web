import type { ActivityTrackingEventDTO } from "@to-do-list/shared";

type ActivityEventListener = (event: ActivityTrackingEventDTO) => void;

const normalizeUserId = (userId: string | number) => String(userId);

class ActivityEventsHub {
  private subscribers = new Map<string, Set<ActivityEventListener>>();

  subscribe(
    userId: string | number,
    listener: ActivityEventListener,
  ): () => void {
    const key = normalizeUserId(userId);

    let listeners = this.subscribers.get(key);

    if (!listeners) {
      listeners = new Set();
      this.subscribers.set(key, listeners);
    }

    listeners.add(listener);

    return () => {
      const current = this.subscribers.get(key);
      if (!current) return;
      current.delete(listener);
      if (current.size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  publish(userId: string | number, event: ActivityTrackingEventDTO): void {
    const listeners = this.subscribers.get(normalizeUserId(userId));
    if (!listeners) return;

    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error("ActivityEventsHub listener error:", error);
      }
    }
  }
}

export const activityEventsHub = new ActivityEventsHub();
