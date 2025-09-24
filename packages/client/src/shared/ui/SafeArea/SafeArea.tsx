import clsx from "clsx";
import { Box, type BoxProps } from "../Box";

import styles from "./SafeArea.module.css";

export interface SafeAreaProps extends BoxProps {}

export const SafeArea = ({ className, ...props }: SafeAreaProps) => {
  return <Box className={clsx(styles.container, className)} {...props} />;
};
