import dayjs, { type Dayjs } from "dayjs";
import {
  applyTimeObjectToDate,
  convertDayjsDateToTimeObject,
  type TimeObject,
} from "~/shared/ui";

export const getCorrectInitialDate = (date: string | null | undefined) => {
  return date ? new Date(date) : new Date();
};

export const getCorrectInitialTime = (
  date: string | null | undefined,
  defaultDate: Dayjs = dayjs()
) => {
  return convertDayjsDateToTimeObject(date ? dayjs(date) : defaultDate);
};

export const prepareDateToRequest = (
  time: TimeObject,
  date: Date,
  format: string = "YYYY-MM-DDTHH:mm"
) => {
  return applyTimeObjectToDate(time, date).format(format);
};
