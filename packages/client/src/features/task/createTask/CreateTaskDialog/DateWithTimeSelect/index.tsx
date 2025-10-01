import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accordion,
  Badge,
  Calendar,
  getTimeString,
  IOSTimePicker,
  Stack,
  Text,
  useTimePicker,
} from "~/shared/ui";
import dayjs from "dayjs";

export type ActiveTrigger = "date" | "time";

export interface DateWithTimeSelectProps {
  label?: string | null;
  date?: string | null;
  onChangeDate?: (value: string | null) => void;
  time?: string | null;
  onChangeTime?: (value: string | null) => void;
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const getCurrectTime = () => dayjs().format("HH:mm:ss");

export const DateWithTimeSelect = ({
  label,
  time,
  // date,
  onChangeTime,
  isExpanded = false,
  onExpandedChange,
}: DateWithTimeSelectProps) => {
  const [activeTrigger, setActiveTrigger] = useState<ActiveTrigger>("date");

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const triggerRef = useRef<ActiveTrigger>("date");
  const accordionRef = useRef<HTMLDivElement>(null);

  const {
    time: _time,
    setHours,
    setMinutes,
  } = useTimePicker(time || getCurrectTime());
  const { hours = 0, minutes = 0 } = _time;

  useEffect(() => {
    onChangeTime?.(getTimeString(_time));
  }, [_time]);

  const handleValueChange = useCallback(
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

  const handleTriggerClick = useCallback((value: ActiveTrigger) => {
    setActiveTrigger(value);
  }, []);

  useEffect(() => {
    if (isExpanded && accordionRef.current) {
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 100);
    }
  }, [isExpanded, activeTrigger]);

  return (
    <Stack.HStack justifyContent="space-between">
      <Accordion.Root
        collapsible
        value={isExpanded ? ["dateSelector"] : []}
        onValueChange={handleValueChange}
        ref={accordionRef}
      >
        <Accordion.Item value="dateSelector">
          <Stack.HStack>
            <Accordion.ItemTrigger
              display="flex"
              flexGrow={1}
              justifyContent="space-between"
              onClick={() => handleTriggerClick("date")}
            >
              <Text fontSize="md">{label}</Text>
              <Badge
                size="lg"
                transition="opacity"
                border="1px solid transparent"
                _hover={{ cursor: "pointer", opacity: "0.5" }}
                {...(isExpanded &&
                  activeTrigger === "date" && {
                    borderColor: "border.inverted",
                  })}
              >
                {dayjs(selectedDate).format("D MMMM YYYY")}
              </Badge>
            </Accordion.ItemTrigger>
            <Accordion.ItemTrigger
              w="auto"
              onClick={() => handleTriggerClick("time")}
            >
              {_time && (
                <Badge
                  size="lg"
                  transition="opacity"
                  border="1px solid transparent"
                  _hover={{ cursor: "pointer", opacity: "0.5" }}
                  {...(isExpanded &&
                    activeTrigger === "time" && {
                      borderColor: "border.inverted",
                    })}
                >
                  {getTimeString(_time)}
                </Badge>
              )}
            </Accordion.ItemTrigger>
          </Stack.HStack>

          <Accordion.ItemContent>
            <Accordion.ItemBody display="flex" justifyContent="center">
              {activeTrigger === "date" && (
                <Calendar
                  selectedDate={selectedDate}
                  onChangeSelectedDate={(date) => {
                    if (!date) return;
                    setSelectedDate(date);
                  }}
                />
              )}
              {activeTrigger === "time" && (
                <IOSTimePicker
                  loop
                  hours={hours}
                  minutes={minutes}
                  onChangeHours={setHours}
                  onChangeMinutes={setMinutes}
                />
              )}
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
    </Stack.HStack>
  );
};
