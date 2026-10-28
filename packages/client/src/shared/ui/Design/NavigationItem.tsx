import clsx from "clsx";
import { Box, type BoxProps } from "../Box";
import styles from "./Design.module.css";

export function NavigationItem({
  active,
  className,
  ...props
}: BoxProps & { active?: boolean }) {
  return (
    <Box
      className={clsx(styles.navigationItem, className)}
      data-active={active}
      {...props}
    />
  );
}
