import type { Dayjs } from "dayjs";
import { Box, Flex, Stack, Text } from "~/shared/ui";
import { DayActivityMarker } from "../DayActivityMarker";

import glass from "~/shared/styles/glass.module.css";

/** Обводка сегодняшнего дня — акцентный цвет вне палитры темы. */
const TODAY_OUTLINE_COLOR = "#0cd3fba8";

type DayCellProps = {
  day: Dayjs;
  weekdayLabel: string;
  isSelected: boolean;
  isToday: boolean;
  /** undefined — данные по дню ещё не загружены */
  activityCount?: number;
  onSelect: (day: Dayjs) => void;
};

/** Ячейка одного дня: подпись дня недели, маркеры активностей и кнопка с числом. */
export function DayCell({
  day,
  weekdayLabel,
  isSelected,
  isToday,
  activityCount,
  onSelect,
}: DayCellProps) {
  return (
    <Stack.VStack
      gap={1}
      alignItems="center"
      justifyContent="space-between"
      bg={isSelected ? "gray.emphasized" : "bg.muted"}
      borderRadius="full"
      p="5px"
      h="90px"
      className={glass.glass}
    >
      <Text textAlign="center" textStyle="xs" mt="0.2rem" color="gray.400">
        {weekdayLabel}
      </Text>

      <Flex
        align="center"
        justify="center"
        gap="3px"
        h="20px"
        minH="20px"
        aria-hidden
      >
        <DayActivityMarker count={activityCount} />
      </Flex>

      <Box
        as="button"
        w="30px"
        h="30px"
        borderRadius="full"
        display="grid"
        placeItems="center"
        fontWeight="medium"
        cursor="pointer"
        bg={isSelected ? "#ffffff" : "bg.subtle"}
        color={isSelected ? "black" : "#ffffff"}
        border="2px solid transparent"
        borderColor={isToday ? TODAY_OUTLINE_COLOR : "none"}
        aria-pressed={isSelected}
        onClick={() => onSelect(day)}
      >
        {day.date()}
      </Box>
    </Stack.VStack>
  );
}
