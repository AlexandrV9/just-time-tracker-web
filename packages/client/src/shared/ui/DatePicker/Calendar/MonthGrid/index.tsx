import {
  DatePicker,
  type UseDatePickerContext,
} from "@ark-ui/react/date-picker";
import { Box } from "~/shared/ui/Box";

type MonthGridProps = { datePicker: UseDatePickerContext; columns?: number };

export const MonthGrid = ({ datePicker, columns = 4 }: MonthGridProps) => (
  <DatePicker.Table
    style={{ borderCollapse: "separate", borderSpacing: "0.5rem" }}
    width="100%"
  >
    <DatePicker.TableBody>
      {datePicker
        .getMonthsGrid({ columns, format: "short" })
        .map((months, rowId) => (
          <DatePicker.TableRow key={rowId}>
            {months.map((month, colId) => (
              <DatePicker.TableCell key={colId} value={month.value}>
                <DatePicker.TableCellTrigger>
                  <Box
                    width="60px"
                    bg="bg.muted"
                    py="0.4rem"
                    px="0.1rem"
                    borderRadius="full"
                    textAlign="center"
                  >
                    {month.label}
                  </Box>
                </DatePicker.TableCellTrigger>
              </DatePicker.TableCell>
            ))}
          </DatePicker.TableRow>
        ))}
    </DatePicker.TableBody>
  </DatePicker.Table>
);
