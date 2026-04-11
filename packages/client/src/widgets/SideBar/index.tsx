import { Box, type BoxProps } from "~/shared/ui";

export interface SideBarProps extends BoxProps {}

export const SideBar = (props: SideBarProps) => {
  return <Box {...props} />;
};
