import { ArrowRightIcon, Box, type BoxProps } from "~/shared/ui";

export type NextTriggerProps = Omit<BoxProps, "children">;

export const NextTrigger = ({ ...props }: NextTriggerProps) => {
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
      <ArrowRightIcon />
    </Box>
  );
};
