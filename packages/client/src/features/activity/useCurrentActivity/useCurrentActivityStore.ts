import type {
  ActivityDTO,
  ActivitySessionDTO,
  ActivitySessionSegmentDTO,
} from "@time-tracker/shared";
import { devtools } from "zustand/middleware";
import { create } from "zustand";
import type { Updater } from "~/shared/types";
import { stateUpdater } from "~/shared/utils";

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
          currentActivity: stateUpdater(state.currentActivity, updater),
        })),
      currentSession: null,
      setCurrentSession: (updater) =>
        set((state) => ({
          currentSession: stateUpdater(state.currentSession, updater),
        })),
      currentSegment: null,
      setCurrentSegment: (updater) =>
        set((state) => ({
          currentSegment: stateUpdater(state.currentSegment, updater),
        })),
      updateData: (updater) =>
        set((prevState) => ({
          ...prevState,
          ...stateUpdater(prevState, updater),
        })),
    }),
    { name: "currentActivityStore" },
  ),
);
