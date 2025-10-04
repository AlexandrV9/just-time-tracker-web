import type { DateValue } from "@ark-ui/react";

export const converDateValueToDate = (dateValue: DateValue) => {
  return new Date(dateValue.year, dateValue.month - 1, dateValue.day);
};
