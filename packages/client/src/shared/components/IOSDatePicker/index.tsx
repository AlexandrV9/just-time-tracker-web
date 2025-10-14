import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  Calendar,
  convertDayjsDateToTimeObject,
  getTimeString,
  IOSTimePicker,
  Stack,
  useTimePicker,
  type HighlightedDate,
  type TimeObject,
} from "~/shared/ui";

import dayjs from "dayjs";

import { AccordionItemTrigger } from "./AccordionItemTrigger";
import { formatDate, type Locale } from "~/shared/libs";
import { useTranslation } from "~/shared/hooks";

export type ActiveTrigger = "date" | "time";

export interface IOSDatePickerProps {
  label?: string;

  // date
  date: Date | null;
  onChangeDate: (value: Date | null) => void;

  // time
  time?: TimeObject | null;
  onChangeTime?: (value: TimeObject | null) => void;

  // expanded
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;

  // rules
  minDate?: Date;
  maxDate?: Date;
  isValidDate?: boolean;
  isValidTime?: boolean;

  // other options
  highlightedDates?: HighlightedDate[];
}

export const IOSDatePicker = ({
  label,
  time,
  onChangeTime,
  date,
  onChangeDate,
  isExpanded = false,
  onExpandedChange,
  minDate,
  maxDate,
  isValidTime = true,
  isValidDate = true,
}: IOSDatePickerProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const [activeTrigger, setActiveTrigger] = useState<ActiveTrigger>("date");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return date ? new Date(date) : new Date();
  });

  const accordionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ActiveTrigger>("date");

  const {
    time: _time,
    setHours,
    setMinutes,
  } = useTimePicker(time || convertDayjsDateToTimeObject(dayjs()));
  const { hours = 0, minutes = 0 } = _time;

  const handleChangeAccordionValue = useCallback(
    (event: { value: string[] }) => {
      const isExpanded = event.value.length > 0;
      const isSameTrigger = triggerRef.current === activeTrigger;

      triggerRef.current = activeTrigger;

      if (isExpanded) {
        onExpandedChange?.(true);
        return;
      }

      if (isSameTrigger) {
        onExpandedChange?.(false);
        return;
      }
    },
    [activeTrigger, onExpandedChange]
  );

  const handleClickAccorionTrigger = useCallback((value: ActiveTrigger) => {
    setActiveTrigger(value);
  }, []);

  const handleChangeSelectedDate = useCallback(
    (date: Date | null) => {
      if (!date) return;

      onChangeDate?.(date);
      setSelectedDate(date);
    },
    [onChangeDate]
  );

  const renderAccorionTriggerContent = () => {
    return (
      <Stack.HStack>
        <AccordionItemTrigger
          display="flex"
          flexGrow={1}
          justifyContent="space-between"
          label={label}
          badgeText={formatDate(selectedDate, "D MMMM YYYY", locale)}
          isActive={activeTrigger === "date"}
          isExpanded={isExpanded}
          onClickTrigger={() => handleClickAccorionTrigger("date")}
          isValid={isValidDate}
        />
        {_time && onChangeTime && (
          <AccordionItemTrigger
            w="fit-content"
            badgeText={getTimeString(_time, {
              formater: ({ h, m }) => `${h}:${m}`,
            })}
            isActive={activeTrigger === "time"}
            isExpanded={isExpanded}
            onClickTrigger={() => handleClickAccorionTrigger("time")}
            isValid={isValidTime}
          />
        )}
      </Stack.HStack>
    );
  };

  const renderAccorionBodyContent = () => {
    switch (activeTrigger) {
      case "date": {
        return (
          <Calendar
            selectedDate={selectedDate}
            onChangeSelectedDate={handleChangeSelectedDate}
            minDate={minDate}
            maxDate={maxDate}
            // highlightedDates={highlightedDates}
            // [
            //   {
            //     color: "red.200",
            //     date: new Date(), // 15 октября
            //     tooltip: "Важное событие",
            //   },
            // ]}
          />
        );
      }
      case "time": {
        return (
          <IOSTimePicker
            loop
            hours={hours}
            minutes={minutes}
            onChangeHours={setHours}
            onChangeMinutes={setMinutes}
          />
        );
      }
      default: {
        const _exhaustiveCheck: never = activeTrigger;
        throw new Error(`Unhandled activeTrigger: ${_exhaustiveCheck}`);
      }
    }
  };

  // Update externam time state after changes in local _time state
  useEffect(() => {
    onChangeTime?.(_time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_time.hours, _time.minutes, _time.seconds]);

  // After change activeTrigger scroll to AccorionBodyContent
  // useEffect(() => {
  //   if (isExpanded && accordionRef.current) {
  //     setTimeout(() => {
  //       accordionRef.current?.scrollIntoView({
  //         behavior: "smooth",
  //         block: "start",
  //         inline: "nearest",
  //       });
  //     }, 100);
  //   }
  // }, [isExpanded, activeTrigger]);

  const accordionTriggerContent = renderAccorionTriggerContent();
  const accorionBodyContent = renderAccorionBodyContent();

  return (
    <Stack.HStack justifyContent="space-between">
      <Accordion.Root
        collapsible
        value={isExpanded ? ["dateSelector"] : []}
        onValueChange={handleChangeAccordionValue}
        ref={accordionRef}
      >
        <Accordion.Item value="dateSelector" border="none">
          {accordionTriggerContent}
          <Accordion.ItemContent>
            <Accordion.ItemBody display="flex" justifyContent="center">
              {accorionBodyContent}
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack.HStack>
  );
};
