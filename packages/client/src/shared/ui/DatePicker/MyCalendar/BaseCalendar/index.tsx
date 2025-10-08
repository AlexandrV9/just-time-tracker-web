import { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { CalendarProvider } from "../useCalendar";
import { Box } from "~/shared/ui/Box";
import { Text } from "~/shared/ui/Text";
import { Button } from "~/shared/ui/Button";
import { Table, TableBody, TableHead, ViewControl } from "../components";

interface BaseCalendarProps {
  selectedDate?: Date | null;
  onDateChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  highlightDates?: Date[];
  disabledDates?: Date[];
  locale?: string;
  size?: "sm" | "md" | "lg";
}

export interface CalendarDay {
  date: Dayjs;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
}

export const BaseCalendar = ({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  // highlightDates = [],
  disabledDates = [],
  // locale = "ru",
  size = "md",
}: BaseCalendarProps) => {
  const [month, setMonth] = useState<Dayjs>(dayjs());

  // Обработчик выбора даты
  const handleDateSelect = (date: Dayjs, isCurrentMonth: boolean) => {
    if (!isCurrentMonth && onDateChange) {
      setMonth(date.startOf("month"));
    }

    if (onDateChange) {
      onDateChange(date.toDate());
    }
  };

  const weekStart = 0;

  // Получение дней месяца для отображения
  const calendarDays = useMemo((): CalendarDay[] => {
    const startOfMonth = month.startOf("month");

    // Определяем первый день для отображения
    // Это понедельник недели, в которой находится 1 число месяца
    let startDate = startOfMonth.startOf("week");

    // Если weekStart = 1 (понедельник), и 1 число попало на воскресенье,
    // нужно начать с предыдущего понедельника
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (weekStart === 1 && startDate.date() !== 1) {
      startDate = startDate.add(1, "day");
    }

    // Всегда 5 строк = 35 дней
    const totalDays = 35;
    const days: CalendarDay[] = [];

    for (let i = 0; i < totalDays; i++) {
      const currentDate = startDate.add(i, "day");
      days.push({
        date: currentDate,
        isToday: currentDate.isSame(dayjs(), "day"),
        isCurrentMonth: currentDate.isSame(month, "month"),
        isWeekend: currentDate.day() === 0 || currentDate.day() === 6,
      });
    }

    return days;
  }, [month, weekStart]);

  // Проверка, является ли дата сегодняшней
  const isToday = (date: Dayjs) => date.isSame(dayjs(), "day");

  // Проверка, является ли дата выбранной
  const isSelected = (date: Dayjs) =>
    selectedDate && date.isSame(dayjs(selectedDate), "day");

  // Проверка, является ли дата из текущего месяца
  const isCurrentMonth = (date: Dayjs) => date.isSame(month, "month");

  // Проверка, заблокирована ли дата
  const isDisabled = (date: Dayjs) => {
    if (minDate && date.isBefore(dayjs(minDate), "day")) return true;
    if (maxDate && date.isAfter(dayjs(maxDate), "day")) return true;
    if (
      disabledDates.some((disabledDate) =>
        date.isSame(dayjs(disabledDate), "day")
      )
    )
      return true;
    return false;
  };

  // Проверка, нужно ли подсветить дату
  // const isHighlighted = (date: Dayjs) =>
  //   highlightDates.some((highlightDate) =>
  //     date.isSame(dayjs(highlightDate), "day")
  //   );

  // Размеры в зависимости от пропса size
  const sizeStyles = {
    sm: { daySize: 8, spacing: 1, fontSize: "sm" },
    md: { daySize: 10, spacing: 2, fontSize: "md" },
    lg: { daySize: 12, spacing: 2, fontSize: "lg" },
  }[size];

  //   // Цвета для light/dark mode
  //   const bgColor = useColorModeValue("white", "gray.800");
  //   const borderColor = useColorModeValue("gray.200", "gray.600");
  //   const headerBg = useColorModeValue("gray.50", "gray.700");
  //   const textColor = useColorModeValue("gray.800", "white");
  //   const mutedTextColor = useColorModeValue("gray.400", "gray.500");
  //   const selectedBg = useColorModeValue("blue.500", "blue.300");
  //   const selectedColor = useColorModeValue("white", "gray.800");
  //   const todayBg = useColorModeValue("blue.100", "blue.700");
  //   const todayColor = useColorModeValue("blue.800", "blue.100");
  //   const highlightedBg = useColorModeValue("orange.100", "orange.700");
  //   const highlightedColor = useColorModeValue("orange.800", "orange.100");
  //   const hoverBg = useColorModeValue("gray.100", "gray.600");

  // Дни недели
  const weekDays = useMemo(() => {
    const startOfWeek = dayjs().startOf("week");
    return Array.from({ length: 7 }, (_, i) =>
      startOfWeek.add(i, "day").format("dd")
    );
  }, []);

  return (
    <CalendarProvider
      month={month}
      setMonth={setMonth}
      date={null}
      minDate={null}
      maxDate={null}
    >
      <Box
        borderRadius="20px"
        bg="black"
        overflow="hidden"
        width="full"
        maxWidth="360px"
      >
        <ViewControl />
        <Table>
          <TableHead>
            {weekDays.map((day, index) => (
              <Text
                key={index}
                textAlign="center"
                fontSize="sm"
                fontWeight="medium"
                // color={mutedTextColor}
                textTransform="uppercase"
              >
                {day}
              </Text>
            ))}
          </TableHead>
          <TableBody>
            {calendarDays.map((day, index) => {
              const isTodayDate = isToday(day.date);
              const isSelectedDate = isSelected(day.date);
              const isCurrentMonthDate = isCurrentMonth(day.date);
              const isDisabledDate = isDisabled(day.date);
              // const isHighlightedDate = isHighlighted(day.date);

              return (
                <Button
                  key={index}
                  size="sm"
                  variant="ghost"
                  width={sizeStyles.daySize}
                  height={sizeStyles.daySize}
                  minW="auto"
                  p={0}
                  fontSize={sizeStyles.fontSize}
                  fontWeight={isTodayDate ? "bold" : "normal"}
                  bg={isSelectedDate ? "bg.emphasized" : "transparent"}
                  //   color={
                  //     !isCurrentMonthDate
                  //       ? mutedTextColor
                  //       : isSelectedDate
                  //       ? selectedColor
                  //       : isTodayDate
                  //       ? todayColor
                  //       : isHighlightedDate
                  //       ? highlightedColor
                  //       : textColor
                  //   }
                  //   bg={
                  //     isSelectedDate
                  //       ? selectedBg
                  //       : isTodayDate
                  //       ? todayBg
                  //       : isHighlightedDate
                  //       ? highlightedBg
                  //       : "transparent"
                  //   }
                  //   _hover={{
                  //     bg: isDisabledDate ? "transparent" : hoverBg,
                  //   }}
                  opacity={!isCurrentMonthDate ? 0.4 : 1}
                  cursor={isDisabledDate ? "not-allowed" : "pointer"}
                  //   isDisabled={isDisabledDate}
                  onClick={() =>
                    !isDisabledDate &&
                    handleDateSelect(day.date, day.isCurrentMonth)
                  }
                  borderRadius="md"
                >
                  {day.date.date()}
                </Button>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </CalendarProvider>
  );
};
