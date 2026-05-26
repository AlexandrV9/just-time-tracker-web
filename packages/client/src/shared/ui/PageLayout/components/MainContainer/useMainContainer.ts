import { useContext } from "react";

import { MainContainerContext } from "./context";

export const useMainContainer = () => {
  const context = useContext(MainContainerContext);

  if (!context) {
    throw new Error("useMainContainer must be used within MainContainer");
  }

  return context;
};
