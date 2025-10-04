import { DatePicker } from "@ark-ui/react";
import { Box } from "~/shared/ui/Box";
import { ArrowRightIcon } from "~/shared/ui/icons";

export interface NextButtonProps extends DatePicker.PrevTriggerProps {}

export const NextButton = ({ disabled, ...props }: NextButtonProps) => {
  return (
    <DatePicker.NextTrigger asChild {...props}>
      <Box
        as="button"
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="8"
        h="8"
        borderRadius="md"
        bg="transparent"
        color={disabled ? "gray.400" : "fg.muted"}
        _hover={
          !disabled
            ? {
                bg: "gray.100",
                color: "fg.default",
                transform: "scale(1.1)",
              }
            : {}
        }
        _active={!disabled ? { transform: "scale(0.95)" } : {}}
        transition="all 0.2s"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
      >
        <ArrowRightIcon size={20} />
      </Box>
    </DatePicker.NextTrigger>
  );
};
