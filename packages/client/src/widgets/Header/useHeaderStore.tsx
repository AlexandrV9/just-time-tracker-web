import { devtools } from "zustand/middleware";
import { create } from "zustand";
import type { ReactNode } from "react";
import { AuthUserAvatar } from "~/features/auth";

type HeaderStore = {
  leftContent?: ReactNode;
  centerContent?: ReactNode;
  rightContent?: ReactNode;
  getContent: (type: "left" | "center" | "right") => ReactNode;
  setContent: (type: "left" | "center" | "right", content: ReactNode) => void;
};

export const useHeaderStore = create<HeaderStore>()(
  devtools((set, get) => ({
    leftContent: <AuthUserAvatar />,
    centerContent: null,
    rightContent: null,

    setContent: (type, content) => {
      switch (type) {
        case "left":
          set({ leftContent: content });
          break;
        case "center":
          set({ centerContent: content });
          break;
        case "right":
          set({ rightContent: content });
          break;
      }
    },
    getContent: (type) => {
      switch (type) {
        case "left":
          return get().leftContent;
        case "center":
          return get().centerContent;
        case "right":
          return get().rightContent;
      }
    },
  }))
);
