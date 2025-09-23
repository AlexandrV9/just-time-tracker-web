import { Box, type BoxProps } from "~/shared/ui";

export interface BottomContainerProps extends BoxProps {}

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
