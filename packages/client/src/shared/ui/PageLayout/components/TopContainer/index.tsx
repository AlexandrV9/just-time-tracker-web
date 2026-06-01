import clsx from "clsx";
import { Z_INDEX } from "~/shared/constants/zIndex";
import { Box, type BoxProps } from "~/shared/ui";

import styles from "./TopContainer.module.css";

export type TopContainerProps = BoxProps;

export const TopContainer = ({
  children,
  className,
  ...props
}: TopContainerProps) => {
  return (
    <Box
      flexShrink={0}
      zIndex={Z_INDEX.header}
      bg="bg"
      className={clsx(styles.container, className)}
      {...props}
    >
      <Box className={styles.content}>{children}</Box>
    </Box>
  );
};
