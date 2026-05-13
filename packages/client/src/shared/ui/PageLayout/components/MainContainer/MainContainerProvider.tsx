import { MainContainerContext } from "./context";

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
