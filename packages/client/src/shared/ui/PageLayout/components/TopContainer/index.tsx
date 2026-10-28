import clsx from "clsx";
import { Z_INDEX } from "~/shared/constants/zIndex";
import { Box, type BoxProps } from "~/shared/ui";

import styles from "./TopContainer.module.css";
import type { CSSProperties } from "react";
import {
  TOP_CONTAINER_CONTENT_WIDTH,
  TOP_CONTAINER_HEIGHT_PX,
} from "./constants";

export type TopContainerProps = BoxProps;

export const TopContainer = ({
  children,
  className,
  style,
  ...props
}: TopContainerProps) => {
  return (
    <Box
      flexShrink={0}
      zIndex={Z_INDEX.header}
      bg="bg"
      className={clsx(styles.container, className)}
      style={
        {
          "--top-container-height": `${TOP_CONTAINER_HEIGHT_PX}px`,
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <Box className={styles.content} w={TOP_CONTAINER_CONTENT_WIDTH}>
        {children}
      </Box>
    </Box>
  );
};
