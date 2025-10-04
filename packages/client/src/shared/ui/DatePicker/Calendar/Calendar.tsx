import { DatePicker, parseDate } from "@ark-ui/react/date-picker";
import { Box } from "../../Box";
import { Text } from "../../Text";
import { useTranslation } from "~/shared/hooks";
import { PrevButton } from "./PrevButton";
import { NextButton } from "./NextButton";
import { useCallback } from "react";
// import type { HighlightedDate } from "./types";
import { DateCell } from "./DateCell";
import {
  converDateValueToDate,
  getDefaultDateCellStyles,
  isDateDisabled,
} from "./utils";

// react-datepicker - https://www.npmjs.com/package/react-datepicker
// react-day-picker - https://daypicker.dev/start

export type CalendarProps = {
  selectedDate?: Date | null;
  onChangeSelectedDate?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  // highlightedDates?: HighlightedDate[];
  getDateCellStyles?: (value: {
    date: Date;
    isDisabled?: boolean;
    isHighlighted?: boolean;
    isCurrentMonth?: boolean;
  }) => Record<string, unknown>;
};

export const Calendar = ({
  selectedDate,
  onChangeSelectedDate,
  minDate,
  maxDate,
  getDateCellStyles = getDefaultDateCellStyles,
}: CalendarProps) => {
  const { i18n } = useTranslation();

  const handleValueChange = useCallback(
    (e: DatePicker.ValueChangeDetails) => {
      const resultDate = converDateValueToDate(e.value[0]);
      onChangeSelectedDate?.(resultDate);
    },
    [onChangeSelectedDate]
  );

  return (
    <DatePicker.Root
      open
      fixedWeeks
      selectionMode="single"
      locale={i18n.language}
      value={selectedDate ? [parseDate(selectedDate)] : []}
      onValueChange={handleValueChange}
      min={minDate ? parseDate(minDate) : undefined}
      max={maxDate ? parseDate(maxDate) : undefined}
      outsideDaySelectable
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
                const visibleWeeks = datePicker.weeks;

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
                        <PrevButton />

                        {/* Текущий период */}
                        <DatePicker.ViewTrigger asChild disabled>
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

                        <NextButton />
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
                          {visibleWeeks.map((week, id) => (
                            <DatePicker.TableRow key={id}>
                              {week.map((date, id) => {
                                const isCurrentMonth =
                                  date.month === currentDisplayMonth;
                                const isDisabled = isDateDisabled({
                                  date,
                                  minDate,
                                  maxDate,
                                });
                                const styles = getDateCellStyles({
                                  date: converDateValueToDate(date),
                                  isCurrentMonth,
                                  isDisabled,
                                  // isHighlighted,
                                });

                                return (
                                  <DateCell
                                    key={id}
                                    date={date}
                                    disabled={isDisabled}
                                    isCurrentMonth={isCurrentMonth}
                                    styles={styles}
                                  />
                                );
                              })}
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
