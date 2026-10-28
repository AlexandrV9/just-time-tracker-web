import { useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import clsx from "clsx";
import { Box, type BoxProps } from "~/shared/ui";
import { MainContainerProvider } from "./MainContainerProvider";

import scrollStyles from "~/shared/styles/scrollArea.module.css";
import styles from "./MainContainer.module.css";

export type MainContainerProps = BoxProps & {
  contentProps?: BoxProps;
};

export const MainContainer = ({
  children,
  className,
  contentProps,
  ...props
}: MainContainerProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  useLayoutEffect(() => {
    const container = viewportRef.current;
    if (!container) return;

    container.scrollTop = 0;
    container.scrollLeft = 0;
  }, [pathname]);

  return (
    <MainContainerProvider containerRef={viewportRef}>
      <Box
        as="main"
        ref={viewportRef}
        className={clsx(styles.root, scrollStyles.scrollArea, className)}
        {...props}
      >
        <Box
          data-page-main-content
          {...contentProps}
          className={clsx(styles.content, contentProps?.className)}
        >
          {children}
        </Box>
      </Box>
    </MainContainerProvider>
  );
};
