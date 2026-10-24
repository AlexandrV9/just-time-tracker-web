import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useRef, useState } from "react";
import { Flex, Stack } from "~/shared/ui";
import { useTranslation } from "~/shared/hooks";
import { MonthYearPicker } from "./MonthYearPicker";
import { MonthYearTrigger } from "./MonthYearTrigger";
import { WeekStrip } from "./WeekStrip";
import { useWeekActivityCounts } from "./useWeekActivityCounts";
import { useWeekCarousel } from "./useWeekCarousel";
import { getMonthYearLabel, resolveLabelDate, toDateKey } from "./utils";

import styles from "./WeekDatePicker.module.css";
import { ArrowNavButton } from "./ArrowButtonTrigger";

type WeekDatePickerProps = {
  value?: Date | null;
  onChange?: (date: Date) => void;
};

/**
 * Бесконечная горизонтальная лента недель: выбор дня, маркеры запланированных
 * активностей и быстрый переход по месяцам.
 */
export function WeekDatePicker({ value, onChange }: WeekDatePickerProps) {
  const { i18n } = useTranslation();

  const {
    viewportRef,
    weekKeys,
    activeWeekStart,
    settledWeekStart,
    scrollPrev,
    scrollNext,
    jumpToWeekOf,
  } = useWeekCarousel(value);

  const activityCountByDate = useWeekActivityCounts(settledWeekStart);

  const [isMonthPickerOpen, setMonthPickerOpen] = useState(false);

  const selectedDay = value ? dayjs(value) : null;
  const selectedDateKey = selectedDay ? toDateKey(selectedDay) : null;
  const labelDate = resolveLabelDate(activeWeekStart, selectedDay);

  // Родитель обычно пересоздаёт onChange на каждый рендер, а от стабильности
  // колбэка зависит memo у WeekStrip — держим свежую ссылку в ref.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleSelectDate = useCallback((day: Dayjs) => {
    onChangeRef.current?.(day.toDate());
  }, []);

  const handleSelectMonth = useCallback(
    (date: Dayjs) => {
      jumpToWeekOf(date);
      onChangeRef.current?.(date.toDate());
    },
    [jumpToWeekOf],
  );

  return (
    <Stack.VStack justify="center" align="center" w="full">
      <Flex
        position="relative"
        justify="center"
        align="center"
        minH={10}
        gap={3}
      >
        <ArrowNavButton
          direction="left"
          aria-label="Previous week"
          onClick={scrollPrev}
        />

        <MonthYearPicker
          open={isMonthPickerOpen}
          onOpenChange={setMonthPickerOpen}
          value={labelDate}
          locale={i18n.language}
          onSelect={handleSelectMonth}
        >
          <MonthYearTrigger
            label={getMonthYearLabel(labelDate, i18n.language)}
          />
        </MonthYearPicker>
        <ArrowNavButton
          direction="right"
          aria-label="Next week"
          onClick={scrollNext}
        />
      </Flex>

      <div className={styles.viewport} ref={viewportRef}>
        <div className={styles.container}>
          {weekKeys.map((weekKey) => (
            <div key={weekKey} className={styles.slide}>
              <WeekStrip
                weekStartKey={weekKey}
                selectedDateKey={selectedDateKey}
                locale={i18n.language}
                activityCountByDate={activityCountByDate}
                onSelectDate={handleSelectDate}
              />
            </div>
          ))}
        </div>
      </div>
    </Stack.VStack>
  );
}
