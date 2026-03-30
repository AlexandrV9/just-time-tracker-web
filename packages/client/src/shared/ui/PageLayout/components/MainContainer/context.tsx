import { createContext, useContext } from "react";

type MainContainerContextType = {
  mainContainerRef: React.RefObject<HTMLElement | null>;
};

const MainContainerContext = createContext<MainContainerContextType | null>(
  null,
);

export const useMainContainer = () => {
  const context = useContext(MainContainerContext);

  if (!context) {
    throw new Error("useMainContainer must be used within MainContainer");
  }

  return context;
};

type MainContainerProviderProps = {
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLElement | null>;
};

export const MainContainerProvider = ({
  containerRef,
  children,
}: MainContainerProviderProps) => {
  return (
    <MainContainerContext.Provider value={{ mainContainerRef: containerRef }}>
      {children}
    </MainContainerContext.Provider>
  );
};
