import { create } from "zustand";

export type UsePwaInstallDialogStore = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export const usePwaInstallDialogStore = create<UsePwaInstallDialogStore>(
  (set) => ({
    open: false,
    setOpen: (value) => set({ open: value }),
  }),
);
