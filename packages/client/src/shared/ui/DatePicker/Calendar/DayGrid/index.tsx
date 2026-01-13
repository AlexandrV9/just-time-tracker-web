import { DatePicker, type UseDatePickerContext } from "@ark-ui/react";
import { Box } from "@chakra-ui/react";
import { Text } from "~/shared/ui/Text";
import { converDateValueToDate, isDateDisabled } from "../utils";
import { DateCell } from "../DateCell";

export type DayGridProps = {
  minDate?: Date;
  maxDate?: Date;
  datePicker: UseDatePickerContext;
  columns?: number;
  getDateCellStyles: (value: {
    date: Date;
    isDisabled?: boolean;
    isHighlighted?: boolean;
    isCurrentMonth?: boolean;
  }) => Record<string, unknown>;
};

export const DayGrid = ({
  datePicker,
  minDate,
  maxDate,
  getDateCellStyles,
}: DayGridProps) => {
  const currentDisplayMonth = datePicker.visibleRange.start.month;
  const visibleWeeks = datePicker.weeks;

  return (
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
                const isCurrentMonth = date.month === currentDisplayMonth;
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
  );
};
