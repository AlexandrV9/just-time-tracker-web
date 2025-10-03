import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  Calendar,
  getDateString,
  getTimeString,
  IOSTimePicker,
  Stack,
  useTimePicker,
} from "~/shared/ui";

import dayjs from "dayjs";

import { AccordionItemTrigger } from "./AccordionItemTrigger";

export type ActiveTrigger = "date" | "time";

export interface DateTimePickerProps {
  label?: string;
  date?: string | null;
  onChangeDate?: (value: string | null) => void;
  time?: string | null;
  onChangeTime?: (value: string | null) => void;
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const getCurrectTime = () => dayjs().format("HH:mm:ss");

export const DateTimePicker = ({
  label,
  time,
  onChangeTime,
  date,
  onChangeDate,
  isExpanded = false,
  onExpandedChange,
}: DateTimePickerProps) => {
  const [activeTrigger, setActiveTrigger] = useState<ActiveTrigger>("date");

  const [selectedDate, setSelectedDate] = useState<Date>(
    date ? new Date(date) : new Date()
  );

  const triggerRef = useRef<ActiveTrigger>("date");

  const accordionRef = useRef<HTMLDivElement>(null);

  const {
    time: _time,
    setHours,
    setMinutes,
  } = useTimePicker(time || getCurrectTime());
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

      onChangeDate?.(dayjs(date).format("YYYY-MM-DD"));
      setSelectedDate(date);
    },
    [onChangeDate]
  );

  const renderAccorionBodyContent = () => {
    switch (activeTrigger) {
      case "date": {
        return (
          <Calendar
            selectedDate={selectedDate}
            onChangeSelectedDate={handleChangeSelectedDate}
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
    onChangeTime?.(
      getTimeString({ hours: _time.hours, minutes: _time.minutes })
    );
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
          <Stack.HStack>
            <AccordionItemTrigger
              display="flex"
              flexGrow={1}
              justifyContent="space-between"
              label={label}
              badgeText={getDateString(selectedDate, "D MMMM YYYY")}
              isActive={activeTrigger === "date"}
              isExpanded={isExpanded}
              onClickTrigger={() => handleClickAccorionTrigger("date")}
            />
            {_time && (
              <AccordionItemTrigger
                w="fit-content"
                badgeText={getTimeString(_time, {
                  formater: ({ h, m }) => `${h}:${m}`,
                })}
                isActive={activeTrigger === "time"}
                isExpanded={isExpanded}
                onClickTrigger={() => handleClickAccorionTrigger("time")}
              />
            )}
          </Stack.HStack>
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
