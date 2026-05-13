import { Box, type BoxProps } from "~/shared/ui";

export type BottomContainerProps = BoxProps;

export const BottomContainer = ({ ...props }: BottomContainerProps) => {
  return (
    <Box
      as="footer"
      borderTop="1px solid"
      borderColor="border.emphasized"
      {...props}
    />
  );
};
