import type { TimeSlotDTO } from "@to-do-list/shared";
import dayjs from "dayjs";
import {
  applyTimeObjectToDayjsDate,
  convertDayjsDateToTimeObject,
  type TimeObject,
} from "~/shared/ui";

import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const getCorrectInitialDate = (
  date: string | null | undefined,
  stepMinutes = 5
): Date => {
  const base = date ? dayjs(date) : dayjs();
  const minutes = base.minute();
  const remainder = minutes % stepMinutes;
  const rounded =
    remainder === 0 ? base : base.add(stepMinutes - remainder, "minute");

  return rounded.second(0).millisecond(0).toDate();
};

export const getCorrectInitialTime = (date: Date | null | undefined) => {
  return convertDayjsDateToTimeObject(dayjs(date));
};

export const prepareDateToRequest = (
  time: TimeObject,
  date: Date,
  format: string = "YYYY-MM-DDTHH:mm"
) => {
  return applyTimeObjectToDayjsDate(time, date).format(format);
};

export const getInitialFormValues = (
  data?: {
    title?: string;
    description?: string;
    startDate?: string | null;
    endDate?: string | null;
  } | null
) => {
  const { startDate, endDate, title, description } = data || {};

  const start = getCorrectInitialDate(startDate);
  const end = getCorrectInitialDate(
    endDate ?? dayjs(start).add(10, "minute").toISOString()
  );

  return {
    title: title ?? "",
    description: description ?? "",
    startDate: getCorrectInitialDate(startDate),
    startTime: getCorrectInitialTime(start),
    endDate: getCorrectInitialDate(endDate),
    endTime: getCorrectInitialTime(end),
  };
};

export function getDayInterval(date: Date | string | number): {
  startDate: string;
  endDate: string;
} {
  const d = new Date(date);

  const startDate = new Date(d);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(d);
  endDate.setHours(23, 59, 59, 999);

  return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
}

export const isStartDateBeforeEndDate = (
  startDate: Date,
  endDate: Date
): boolean => {
  return dayjs(startDate).isBefore(dayjs(endDate));
};

export const isTimeSlotAvailable = (
  selected: { startDate: Date; endDate: Date } | null,
  availableSlots: TimeSlotDTO[]
): boolean => {
  if (!selected) return false;
  if (availableSlots.length === 0) return true;

  return availableSlots.some((slot) => {
    return (
      dayjs(selected.startDate).isSameOrAfter(dayjs(slot.startDate)) &&
      dayjs(selected.endDate).isSameOrBefore(dayjs(slot.endDate))
    );
  });
};
