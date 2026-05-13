import { createContext } from "react";

export type MainContainerContextType = {
  mainContainerRef: React.RefObject<HTMLElement | null>;
};

export const MainContainerContext = createContext<MainContainerContextType | null>(
  null,
);
