import type { ActivityDTO } from "@to-do-list/shared";
import { devtools } from "zustand/middleware";
import { create } from "zustand";
import { useRunningActivity } from "./Stopwatch/useRunningActivity";

type CurrentActivityStoreState = {
  /** Выделение на главной; живой счёт при этом берётся из запущенной сессии. */
  selectedActivityId: string | undefined;
};

type CurrentActivityStoreActions = {
  toggleSelectedActivity: (id: string) => void;
  ensureSelectedActivity: (id: string) => void;
  clearSelectedActivity: () => void;
};

export type CurrentActivityStore = CurrentActivityStoreState &
  CurrentActivityStoreActions;

export const useCurrentActivityStore = create<CurrentActivityStore>()(
  devtools(
    (set, get) => ({
      selectedActivityId: undefined,
      toggleSelectedActivity: (id) =>
        set({
          selectedActivityId:
            get().selectedActivityId === id ? undefined : id,
        }),
      ensureSelectedActivity: (id) => set({ selectedActivityId: id }),
      clearSelectedActivity: () => set({ selectedActivityId: undefined }),
    }),
    { name: "currentActivity" },
  ),
);

export function useCurrentActivity(): {
  currentActivity: ActivityDTO | null;
  selectedActivityId: string | undefined;
  runningActivity: ActivityDTO | undefined;
} {
  const selectedActivityId = useCurrentActivityStore(
    (s) => s.selectedActivityId,
  );
  const { runningActivity, activities } = useRunningActivity();

  const selected =
    selectedActivityId != null
      ? activities.find((a) => a.id === selectedActivityId)
      : undefined;

  const currentActivity = runningActivity ?? selected ?? null;

  return {
    currentActivity,
    selectedActivityId,
    runningActivity,
  };
}
