// YearGrid.tsx
import {
  DatePicker,
  type UseDatePickerContext,
} from "@ark-ui/react/date-picker";
import { Box } from "~/shared/ui/Box";

type YearGridProps = { datePicker: UseDatePickerContext; columns?: number };

export const YearGrid = ({ datePicker, columns = 4 }: YearGridProps) => (
  <DatePicker.Table
    style={{ borderCollapse: "separate", borderSpacing: "0.5rem" }}
    width="100%"
  >
    <DatePicker.TableBody>
      {datePicker.getYearsGrid({ columns }).map((years, rowId) => (
        <DatePicker.TableRow key={rowId}>
          {years.map((year, colId) => (
            <DatePicker.TableCell key={colId} value={year.value}>
              <DatePicker.TableCellTrigger>
                <Box
                  width="full"
                  bg="bg.muted"
                  py="0.4rem"
                  px="0.1rem"
                  borderRadius="12px"
                  textAlign="center"
                >
                  {year.label}
                </Box>
              </DatePicker.TableCellTrigger>
            </DatePicker.TableCell>
          ))}
        </DatePicker.TableRow>
      ))}
    </DatePicker.TableBody>
  </DatePicker.Table>
);

// Я разрабатываю TimeTracker

// TODO:
// 1. Убрать страницу заметок
// 2. Переделать главную страницу
// 3. Заменить название страницы с "Задачи" на "Календарь"