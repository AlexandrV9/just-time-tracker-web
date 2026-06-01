import clsx from "clsx";
import { Box, type BoxProps } from "~/shared/ui";

import styles from "./BottomContainer.module.css";

export type BottomContainerProps = BoxProps;

export const BottomContainer = ({
  children,
  className,
  ...props
}: BottomContainerProps) => {
  return (
    <Box
      as="footer"
      bg="bg"
      borderTop="1px solid"
      borderColor="border.emphasized"
      className={clsx(styles.wrapper, className)}
      {...props}
    >
      <Box className={styles.content}>{children}</Box>
    </Box>
  );
};
