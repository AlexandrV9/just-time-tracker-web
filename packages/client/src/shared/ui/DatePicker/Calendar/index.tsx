import { DatePicker, parseDate } from "@ark-ui/react/date-picker";
import { Box } from "../../Box";
import { Text } from "../../Text";

// react-datepicker - https://www.npmjs.com/package/react-datepicker
// react-day-picker - https://daypicker.dev/start

export type CalendarProps = {
  selectedDate?: Date | null;
  onChangeSelectedDate?: (date: Date | null) => void;
};

export const Calendar = ({
  selectedDate,
  onChangeSelectedDate,
}: CalendarProps) => {
  return (
    <DatePicker.Root
      open
      fixedWeeks
      selectionMode="single"
      onValueChange={(e) => {
        onChangeSelectedDate?.(new Date(e.valueAsString[0]));
      }}
      value={selectedDate ? [parseDate(selectedDate)] : []}
    >
      <Box
        asChild
        bg="bg"
        borderRadius="2xl"
        w="fit-content"
        p="0.5rem"
        borderSpacing="1"
        borderCollapse="separate"
      >
        <DatePicker.Content>
          <DatePicker.View view="day">
            <DatePicker.Context>
              {(datePicker) => {
                const currentDisplayMonth = datePicker.visibleRange.start.month;

                return (
                  <Box>
                    <DatePicker.ViewControl>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        w="100%"
                        p="3"
                      >
                        {/* Кнопка назад */}
                        <DatePicker.PrevTrigger asChild>
                          <Box
                            as="button"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            w="8"
                            h="8"
                            borderRadius="md"
                            bg="transparent"
                            color="fg.muted"
                            _hover={{
                              bg: "gray.100",
                              color: "fg.default",
                              transform: "scale(1.1)",
                            }}
                            _active={{ transform: "scale(0.95)" }}
                            transition="all 0.2s"
                            cursor="pointer"
                          >
                            <Text fontSize="lg" fontWeight="bold">
                              ‹
                            </Text>
                          </Box>
                        </DatePicker.PrevTrigger>

                        {/* Текущий период */}
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
                            _hover={{
                              bg: "gray.900",
                              boxShadow: "sm",
                            }}
                            transition="all 0.2s"
                            cursor="pointer"
                          >
                            <DatePicker.RangeText />
                          </Box>
                        </DatePicker.ViewTrigger>

                        {/* Кнопка вперед */}
                        <DatePicker.NextTrigger asChild>
                          <Box
                            as="button"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            w="8"
                            h="8"
                            borderRadius="md"
                            bg="transparent"
                            color="fg.muted"
                            _hover={{
                              bg: "gray.100",
                              color: "fg.default",
                              transform: "scale(1.1)",
                            }}
                            _active={{ transform: "scale(0.95)" }}
                            transition="all 0.2s"
                            cursor="pointer"
                          >
                            <Text fontSize="lg" fontWeight="bold">
                              ›
                            </Text>
                          </Box>
                        </DatePicker.NextTrigger>
                      </Box>
                    </DatePicker.ViewControl>
                    <Box
                      asChild
                      bg="bg"
                      w="fit-content"
                      p="0.5rem"
                      borderSpacing="10px"
                      borderCollapse="separate"
                    >
                      <DatePicker.Table>
                        <DatePicker.TableHead>
                          <DatePicker.TableRow>
                            {datePicker.weekDays.map((weekDay, id) => (
                              <Box asChild w="30px" h="30px" key={id}>
                                <DatePicker.TableHeader>
                                  <Text
                                    as="span"
                                    fontSize="sm"
                                    color="fg.muted"
                                    fontWeight="medium"
                                  >
                                    {weekDay.short}
                                  </Text>
                                </DatePicker.TableHeader>
                              </Box>
                            ))}
                          </DatePicker.TableRow>
                        </DatePicker.TableHead>
                        <DatePicker.TableBody>
                          {datePicker.weeks.map((week, id) => (
                            <DatePicker.TableRow key={id}>
                              {week.map((day, id) => (
                                <DatePicker.TableCell value={day} key={id}>
                                  <Box
                                    display="grid"
                                    asChild
                                    placeItems="center"
                                    w="30px"
                                    h="30px"
                                    borderRadius="l3"
                                    bg={
                                      day.month !== currentDisplayMonth
                                        ? "bg.subtle"
                                        : "transparent"
                                    }
                                    _selected={{
                                      bg: "blue.500",
                                      color: "white",
                                      _hover: {
                                        bg: "blue.600",
                                      },
                                    }}
                                    _today={{
                                      border: "2px solid",
                                      borderColor: "blue.300",
                                    }}
                                    _hover={{
                                      bg:
                                        day.month !== currentDisplayMonth
                                          ? "gray.100"
                                          : "gray.500",
                                      cursor: "pointer",
                                    }}
                                    opacity={
                                      day.month !== currentDisplayMonth
                                        ? 0.4
                                        : 1
                                    }
                                    pointerEvents={
                                      day.month !== currentDisplayMonth
                                        ? "none"
                                        : "auto"
                                    }
                                  >
                                    <DatePicker.TableCellTrigger asChild>
                                      <Text
                                        as="span"
                                        fontSize="sm"
                                        fontWeight={
                                          day.month === currentDisplayMonth
                                            ? "medium"
                                            : "normal"
                                        }
                                      >
                                        {day.day}
                                      </Text>
                                    </DatePicker.TableCellTrigger>
                                  </Box>
                                </DatePicker.TableCell>
                              ))}
                            </DatePicker.TableRow>
                          ))}
                        </DatePicker.TableBody>
                      </DatePicker.Table>
                    </Box>
                  </Box>
                );
              }}
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </Box>
    </DatePicker.Root>
  );
};
