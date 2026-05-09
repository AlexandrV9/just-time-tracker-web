import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@to-do-list/shared";
import { devtools } from "zustand/middleware";
import { create } from "zustand";
import type { Updater } from "~/shared/types";

export type CurrentActivityStore = {
  currentActivity: ActivityDTO | null;
  setCurrentActivity: (updater: Updater<ActivityDTO | null>) => void;

  currentSession: ActivitySessionDTO | null;
  setCurrentSession: (updater: Updater<ActivitySessionDTO | null>) => void;

  currentSegment: ActivitySessionSegmentDTO | null;
  setCurrentSegment: (
    updater: Updater<ActivitySessionSegmentDTO | null>,
  ) => void;

  updateData: (
    updater: Updater<
      Partial<{
        currentActivity?: ActivityDTO | null;
        currentSession?: ActivitySessionDTO | null;
        currentSegment?: ActivitySessionSegmentDTO | null;
      }>
    >,
  ) => void;
  clearData: () => void;
};

export const useCurrentActivityStore = create<CurrentActivityStore>()(
  devtools(
    (set) => ({
      currentActivity: null,
      setCurrentActivity: (updater) =>
        set((state) => ({
          currentActivity:
            typeof updater === "function"
              ? updater(state.currentActivity)
              : updater,
        })),
      currentSession: null,
      setCurrentSession: (updater) =>
        set((state) => ({
          currentSession:
            typeof updater === "function"
              ? updater(state.currentSession)
              : updater,
        })),
      currentSegment: null,
      setCurrentSegment: (updater) =>
        set((state) => ({
          currentSegment:
            typeof updater === "function"
              ? updater(state.currentSegment)
              : updater,
        })),
      updateData: (updater) =>
        set((prevState) => {
          const nextState =
            typeof updater === "function" ? updater(prevState) : updater;
          return { ...prevState, ...nextState } as CurrentActivityStore;
        }),
    }),
    { name: "currentActivityStore" },
  ),
);
