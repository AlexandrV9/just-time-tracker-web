import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  Box,
  Calendar,
  convertDayjsDateToTimeObject,
  getTimeString,
  IOSTimePicker,
  Stack,
  Text,
  useTimePicker,
  type TimeObject,
} from "~/shared/ui";

import dayjs from "dayjs";

import { AccordionItemTrigger } from "./AccordionItemTrigger";
import { formatDate, type Locale } from "~/shared/libs";
import { useTranslation } from "~/shared/hooks";

type ActiveTrigger = "date" | "startTime" | "endTime";

export interface IOSRangeDatePickerProps {
  label?: string;

  // date
  date?: Date | null;
  onChangeDate?: (value: Date | null) => void;

  // start time
  startTime?: TimeObject | null;
  onChangeStartTime?: (value: TimeObject | null) => void;

  // end time
  endTime?: TimeObject | null;
  onChangeEndTime?: (value: TimeObject | null) => void;

  // expanded
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;

  // rules
  minDate?: Date;
  maxDate?: Date;
  isValidDate?: boolean;
  isValidTime?: boolean;
  errorMessage?: string;
}

export const IOSRangeDatePickers = ({
  label,
  startTime,
  onChangeStartTime,
  endTime,
  onChangeEndTime,
  date,
  onChangeDate,
  isExpanded = false,
  onExpandedChange,
  minDate,
  maxDate,
  isValidTime = true,
  isValidDate = true,
  errorMessage,
}: IOSRangeDatePickerProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const [activeTrigger, setActiveTrigger] = useState<ActiveTrigger>("date");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    return date ? new Date(date) : new Date();
  });

  const accordionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ActiveTrigger>("date");

  const {
    time: _startTime,
    setHours: setStartHours,
    setMinutes: setStartMinutes,
  } = useTimePicker(startTime || convertDayjsDateToTimeObject(dayjs()));
  const { hours: startHours = 0, minutes: startMinutes = 0 } = _startTime;

  const {
    time: _endTime,
    setHours: setEndHours,
    setMinutes: setEndMinutes,
  } = useTimePicker(endTime || convertDayjsDateToTimeObject(dayjs()));
  const { hours: endHours = 0, minutes: endMinutes = 0 } = _endTime;

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

  const renderAccordionTriggerContent = () => {
    return (
      <Stack.VStack align="stretch" position="relative">
        <Stack.HStack gap={2}>
          {date && (
            <AccordionItemTrigger
              w="fit-content"
              badgeText={formatDate(selectedDate, "D MMMM YYYY", locale)}
              isActive={activeTrigger === "date"}
              isExpanded={isExpanded}
              onClickTrigger={() => handleClickAccorionTrigger("date")}
              isValid={isValidDate}
            />
          )}
          <Stack.HStack gap={2}>
            {_startTime && onChangeStartTime && (
              <AccordionItemTrigger
                w="fit-content"
                badgeText={getTimeString(_startTime, {
                  formater: ({ h, m }) => `${h}:${m}`,
                })}
                isActive={activeTrigger === "startTime"}
                isExpanded={isExpanded}
                onClickTrigger={() => handleClickAccorionTrigger("startTime")}
                isValid={isValidTime}
              />
            )}
            <Box h="1px" width="20px" bg="gray.700" />
            {_endTime && onChangeEndTime && (
              <AccordionItemTrigger
                w="fit-content"
                badgeText={getTimeString(_endTime, {
                  formater: ({ h, m }) => `${h}:${m}`,
                })}
                isActive={activeTrigger === "endTime"}
                isExpanded={isExpanded}
                onClickTrigger={() => handleClickAccorionTrigger("endTime")}
                isValid={isValidTime}
              />
            )}
          </Stack.HStack>
        </Stack.HStack>
        {errorMessage && (
          <Text position="absolute" bottom="-40px" color="fg.error">
            {errorMessage}
          </Text>
        )}
      </Stack.VStack>
    );
  };

  const renderAccordionBodyContent = () => {
    switch (activeTrigger) {
      case "date": {
        return (
          <Calendar
            selectedDate={selectedDate}
            onChangeSelectedDate={handleChangeSelectedDate}
            minDate={minDate}
            maxDate={maxDate}
          />
        );
      }
      case "startTime": {
        return (
          <IOSTimePicker
            key="startTime"
            loop
            hours={startHours}
            minutes={startMinutes}
            minuteStep={5}
            onChangeHours={setStartHours}
            onChangeMinutes={setStartMinutes}
          />
        );
      }
      case "endTime":
        return (
          <IOSTimePicker
            key="endTime"
            loop
            hours={endHours}
            minutes={endMinutes}
            minuteStep={5}
            onChangeHours={setEndHours}
            onChangeMinutes={setEndMinutes}
          />
        );
      default: {
        const _exhaustiveCheck: never = activeTrigger;
        throw new Error(`Unhandled activeTrigger: ${_exhaustiveCheck}`);
      }
    }
  };

  // Update external startTime state after changes in local _time state
  useEffect(() => {
    onChangeStartTime?.(_startTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_startTime.hours, _startTime.minutes, _startTime.seconds]);

  // Update external endTime state after changes in local _time state
  useEffect(() => {
    onChangeEndTime?.(_endTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_endTime.hours, _endTime.minutes, _endTime.seconds]);

  const accordionTriggerContent = renderAccordionTriggerContent();
  const accordionBodyContent = renderAccordionBodyContent();

  return (
    <Stack.VStack align="stretch" w="full">
      {label && <Text>{label}</Text>}
      <Accordion.Root
        collapsible
        value={isExpanded ? ["dateSelector"] : []}
        onValueChange={handleChangeAccordionValue}
        ref={accordionRef}
      >
        <Accordion.Item value="dateSelector" border="none">
          {accordionTriggerContent}
          <Accordion.ItemContent>
            <Accordion.ItemBody display="flex" justifyContent="center" py={12}>
              {accordionBodyContent}
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack.VStack>
  );
};
