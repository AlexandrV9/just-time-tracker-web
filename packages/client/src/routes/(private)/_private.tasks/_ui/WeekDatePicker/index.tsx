import dayjs, { Dayjs } from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { Box, Flex, Stack, Text } from "~/shared/ui";
import { PrevTrigger } from "./PrevTrigger";
import { NextTrigger } from "./NextTrigger";
import { getSunday, getWeekdayLabel, getWeekDays } from "./utils";

type WeekDatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date) => void;
};

export function WeekDatePicker({ value, onChange }: WeekDatePickerProps) {
  const [weekAnchor, setWeekAnchor] = useState(() =>
    getSunday(value ? dayjs(value) : dayjs())
  );

  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);

  const handleSelectDate = useCallback(
    (day: Dayjs) => {
      onChange?.(day.toDate());
    },
    [onChange]
  );

  const handleClickPrevTrigger = useCallback(() => {
    setWeekAnchor((w) => w.subtract(7, "day"));
  }, []);

  const handleClickNextTrigger = useCallback(() => {
    setWeekAnchor((w) => w.add(7, "day"));
  }, []);

  return (
    <Stack.VStack justify="center">
      <Flex
        w="full"
        position="relative"
        justify="center"
        align="center"
        minH={10}
        gap={3}
      >
        <PrevTrigger onClick={handleClickPrevTrigger} />
        <Text textStyle="lg" fontWeight="medium">
          {weekAnchor.format("MMMM YYYY")}
        </Text>
        <NextTrigger onClick={handleClickNextTrigger} />
      </Flex>
      <Flex gap={2} w="full" justifyContent="space-between">
        {weekDays.map((day) => {
          const isSelected = value ? dayjs(value).isSame(day, "day") : false;
          const isToday = day.isSame(dayjs(), "day");

          return (
            <Stack.VStack
              key={day.toString()}
              gap={3}
              bg={isSelected ? "gray.emphasized" : "bg.muted"}
              borderRadius="full"
              p="5px"
            >
              <Text textAlign="center" textStyle="lg" color="gray.400">
                {getWeekdayLabel(day)}
              </Text>
              <Box
                as="button"
                w="32px"
                h="32px"
                borderRadius="full"
                display="grid"
                placeItems="center"
                fontWeight="medium"
                bg={isSelected ? "#ffffff" : "bg.emphasized"}
                color={isSelected ? "black" : "#ffffff"}
                outline={isToday ? "2px solid" : "none"}
                outlineColor="#0cd3fba8"
                onClick={() => handleSelectDate(day)}
                _hover={{
                  cursor: "pointer",
                }}
              >
                {day.date()}
              </Box>
            </Stack.VStack>
          );
        })}
      </Flex>
    </Stack.VStack>
  );
}
