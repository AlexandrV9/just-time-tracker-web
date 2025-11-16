import { useEffect, useRef } from "react";
import { EventBus, type Listener } from ".";

export const eventBus = new EventBus();

export const useEventBus = (event: string, listener: Listener) => {
  const eventBusRef = useRef(eventBus);

  useEffect(() => {
    const unsubscribe = eventBus.on(event, listener);
    return () => unsubscribe();
  });

  return eventBusRef;
};
