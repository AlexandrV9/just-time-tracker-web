import type { ActivityDTO } from "@to-do-list/shared";
import { devtools } from "zustand/middleware";
import { create } from "zustand";

import { useShallow } from "zustand/react/shallow";

export type SelectedActivityStore = {
  activity: ActivityDTO | null;
  setActivity: (activity: ActivityDTO | null) => null;
};

export const useSelectedActivityStore = create<SelectedActivityStore>()(
  devtools(
    (set) => ({
      activity: null,
      setActivity: (activity) => set({ activity }),
    }),
    { name: "selectedActivity" },
  ),
);

export function useSelectedActivity() {
  return useSelectedActivityStore(
    useShallow((state) => ({
      activity: state.activity,
      setActivity: state.setActivity,
    })),
  );
}
