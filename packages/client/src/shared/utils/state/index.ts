import type { Updater } from "~/shared/types";

export const stateUpdater = <T>(state: T, updater: Updater<T>): T => {
  if (typeof updater === "function") {
    return (updater as (current: T) => T)(state);
  }
  return updater;
};
