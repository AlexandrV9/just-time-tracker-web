import { DatePicker } from "@ark-ui/react";
import { Box } from "~/shared/ui/Box";
import { Text } from "~/shared/ui/Text";

export interface DateCellProps extends Omit<DatePicker.TableCellProps, "value"> {
  date: DatePicker.DateValue;
  /**
   * This is day in current month
   */
  isCurrentMonth?: boolean;
  styles?: Record<string, unknown>;
}

export const DateCell = ({
  date,
  isCurrentMonth = false,
  styles,
}: DateCellProps) => {
  return (
    <DatePicker.TableCell value={date}>
      <Box
        display="grid"
        asChild
        placeItems="center"
        w="30px"
        h="30px"
        borderRadius="l3"
        fontSize="sm"
        fontWeight={isCurrentMonth ? "medium" : "normal"}
        transition="all 0.2s"
        {...styles}
      >
        <DatePicker.TableCellTrigger asChild>
          <Text
            as="span"
            fontSize="sm"
            fontWeight={isCurrentMonth ? "medium" : "normal"}
          >
            {date.day}
          </Text>
        </DatePicker.TableCellTrigger>
      </Box>
    </DatePicker.TableCell>
  );
};
