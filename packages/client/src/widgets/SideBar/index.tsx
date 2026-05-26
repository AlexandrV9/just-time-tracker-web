import { Box, type BoxProps } from "~/shared/ui";

export type SideBarProps = BoxProps;

export const SideBar = (props: SideBarProps) => {
  return <Box {...props} />;
};
