import { useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useRef } from "react";
import clsx from "clsx";
import { Box, type BoxProps } from "~/shared/ui";
import { MainContainerProvider } from "./MainContainerProvider";

import styles from "./MainContainer.module.css";

export type MainContainerProps = BoxProps;

export const MainContainer = ({
  children,
  className,
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
        className={clsx(styles.root, className)}
        {...props}
      >
        <Box className={styles.content} data-page-main-content>
          {children}
        </Box>
      </Box>
    </MainContainerProvider>
  );
};
