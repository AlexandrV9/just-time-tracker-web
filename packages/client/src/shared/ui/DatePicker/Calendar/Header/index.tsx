import { DatePicker } from "@ark-ui/react/date-picker";
import { Box } from "~/shared/ui/Box";
import { PrevButton } from "./PrevButton";
import { NextButton } from "./NextButton";

export const CalendarHeader = () => (
  <DatePicker.ViewControl>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      w="100%"
      p="3"
    >
      <PrevButton />
      <DatePicker.ViewTrigger asChild>
        <Box
          as="button"
          px="4"
          py="2"
          borderRadius="lg"
          bg="transparent"
          color="fg.default"
          fontWeight="semibold"
          fontSize="md"
          _hover={{ bg: "gray.900", boxShadow: "sm" }}
          transition="all 0.2s"
          cursor="pointer"
        >
          <DatePicker.RangeText />
        </Box>
      </DatePicker.ViewTrigger>
      <NextButton />
    </Box>
  </DatePicker.ViewControl>
);
