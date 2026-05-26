import dayjs from "dayjs";

import styles from "./IOSDatePicker.module.css";

import { IOSPickerItem } from "./IOSPickerItem";
import { Box } from "../../Box";
import type { EmblaOptionsType } from "embla-carousel";
import { useTranslation } from "~/shared/hooks";
import { useMemo } from "react";

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getMonthNames = (locale: string) =>
  Array.from({ length: 12 }, (_, month) => {
    const parts = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
    }).formatToParts(new Date(2020, month, 1));

    return parts.find((p) => p.type === "month")?.value ?? "";
  });

export type IOSDatePickerProps = {
  loop?: EmblaOptionsType["loop"];
  day?: number;
  onChangeDay?: (value: number) => void;
  month?: number;
  onChangeMonth?: (value: number) => void;
  year?: number;
  onChangeYear?: (value: number) => void;
  minYear?: number;
  maxYear?: number;
};

export const IOSDatePicker = ({
  loop,
  day,
  month,
  year,
  onChangeDay,
  onChangeMonth,
  onChangeYear,
  minYear = dayjs().year() - 50,
  maxYear = dayjs().year() + 50,
}: IOSDatePickerProps) => {
  const { i18n } = useTranslation();

  const safeYear = year ?? dayjs().year();
  const safeMonth = month ?? dayjs().month();

  const daysInMonth = getDaysInMonth(safeYear, safeMonth);

  const monthLabels = useMemo(
    () => getMonthNames(i18n.language),
    [i18n.language]
  );

  const dateUnits = [
    {
      value: day,
      handler: onChangeDay,
      slideCount: daysInMonth,
      step: 1,
      perspective: "left" as const,
      offset: 1,
    },
    {
      value: month,
      handler: onChangeMonth,
      slideCount: 12,
      step: 1,
      perspective: "center" as const,
      labels: monthLabels,
    },
    {
      value: year,
      handler: onChangeYear,
      slideCount: maxYear - minYear + 1,
      step: 1,
      perspective: "right" as const,
      offset: minYear,
    },
  ].filter((unit) => unit.handler);

  if (dateUnits.length === 0) return null;

  return (
    <Box
      className={styles.container}
      display="grid"
      gridTemplateColumns={`repeat(${dateUnits.length}, 1fr)`}
    >
      {dateUnits.map((unit, index) => (
        <IOSPickerItem
          key={index}
          slideCount={unit.slideCount}
          step={unit.step}
          loop={loop}
          perspective={unit.perspective}
          value={
            unit.offset != null && unit.value != null
              ? unit.value - unit.offset
              : unit.value
          }
          onValueChange={(v) =>
            unit.handler?.(unit.offset != null ? v + unit.offset : v)
          }
          formatValue={(v) =>
            unit.labels
              ? unit.labels[v]
              : (v + (unit.offset ?? 0)).toString().padStart(2, "0")
          }
        />
      ))}
    </Box>
  );
};
