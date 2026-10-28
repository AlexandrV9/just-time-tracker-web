import clsx from "clsx";
import { Box, type BoxProps } from "../Box";
import styles from "./Design.module.css";

export function DesignTheme({
  appearance = "dark",
  className,
  ...props
}: BoxProps & { appearance?: "dark" | "inherit" }) {
  return (
    <Box
      data-appearance={appearance}
      className={clsx(styles.theme, className)}
      {...props}
    />
  );
}
