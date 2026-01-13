import { DatePicker, parseDate } from "@ark-ui/react/date-picker";
import { Box } from "../../Box";
import { useTranslation } from "~/shared/hooks";
import { useCallback } from "react";
import { converDateValueToDate, getDefaultDateCellStyles } from "./utils";
import { MonthGrid } from "./MonthGrid";
import { YearGrid } from "./YearGrid";
import { CalendarHeader } from "./Header";
import { DayGrid } from "./DayGrid";

// Аналоги
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
        w="full"
        p="0.5rem"
        borderSpacing={1}
        borderCollapse="separate"
      >
        <DatePicker.Content>
          <DatePicker.View view="day">
            <DatePicker.Context>
              {(datePicker) => {
                return (
                  <>
                    <CalendarHeader />
                    <DayGrid
                      datePicker={datePicker}
                      getDateCellStyles={getDateCellStyles}
                    />
                  </>
                );
              }}
            </DatePicker.Context>
          </DatePicker.View>

          <DatePicker.View view="month">
            <DatePicker.Context>
              {(datePicker) => (
                <>
                  <CalendarHeader />
                  <MonthGrid datePicker={datePicker} />
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>

          <DatePicker.View view="year">
            <DatePicker.Context>
              {(datePicker) => (
                <>
                  <CalendarHeader />
                  <YearGrid datePicker={datePicker} />
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </Box>
    </DatePicker.Root>
  );
};
