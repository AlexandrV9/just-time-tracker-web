import { useRef } from "react";
import { ScrollArea, type ScrollAreaRootProps } from "~/shared/ui";
import { MainContainerProvider } from "./MainContainerProvider";

export type MainContainerProps = ScrollAreaRootProps;

export const MainContainer = ({ children, ...props }: MainContainerProps) => {
  const viewportRef = useRef(null);

  return (
    <MainContainerProvider containerRef={viewportRef}>
      <ScrollArea.Root as="main" display="flex" size="xs" {...props}>
        <ScrollArea.Viewport ref={viewportRef}>
          <ScrollArea.Content
            flexGrow={1}
            display="flex"
            flexDirection="column"
          >
            {children}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        {/* <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar> */}
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </MainContainerProvider>
  );
};
