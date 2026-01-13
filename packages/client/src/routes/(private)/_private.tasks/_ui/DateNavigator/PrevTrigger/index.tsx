import { ArrowLeftIcon, Box, type BoxProps } from "~/shared/ui";

export interface PrevTriggerProps extends Omit<BoxProps, "children"> {}

export const PrevTrigger = ({ ...props }: PrevTriggerProps) => {
  return (
    <Box
      as="button"
      w="32px"
      h="32px"
      display="grid"
      placeItems="center"
      borderRadius="full"
      color="fg"
      bg="bg.muted"
      {...props}
      _hover={{
        cursor: "pointer",
      }}
    >
      <ArrowLeftIcon />
    </Box>
  );
};
