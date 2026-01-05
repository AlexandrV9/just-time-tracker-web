import type { EmblaOptionsType } from "embla-carousel";

import styles from "./IOSTimePicker.module.css";

import { IOSPickerItem } from "./IOSPickerItem";
import { Box } from "../../Box";

export type IOSTimeTimeUnit = {
  value?: number;
  handler?: (value: number) => void;
  slideCount: number;
  perspective: "left" | "center" | "right";
  step?: number;
};

export type IOSTimePickerProps = {
  loop?: EmblaOptionsType["loop"];

  // hours
  hours?: number;
  onChangeHours?: (value: number) => void;

  // minutes
  minutes?: number;
  minuteStep?: number;
  onChangeMinutes?: (value: number) => void;

  // seconds
  seconds?: number;
  onChangeSeconds?: (value: number) => void;
};

export const IOSTimePicker = ({
  loop,
  onChangeHours,
  hours,
  onChangeMinutes,
  minutes,
  minuteStep = 1,
  onChangeSeconds,
  seconds,
}: IOSTimePickerProps) => {
  const allTimeUnits: IOSTimeTimeUnit[] = [
    {
      value: hours,
      handler: onChangeHours,
      slideCount: 24,
      step: 1,
      perspective: "left",
    },
    {
      value: minutes,
      handler: onChangeMinutes,
      slideCount: 60,
      step: minuteStep,
      perspective: "center",
    },
    {
      value: seconds,
      handler: onChangeSeconds,
      slideCount: 60,
      step: 1,
      perspective: "right",
    },
  ];

  const activeTimeUnits = allTimeUnits.filter((unit) => unit.handler);
  const countActiveTimeUnits = activeTimeUnits.length;

  const getAdjustedPerspective = (index: number) => {
    if (countActiveTimeUnits === 1) {
      return "center" as const;
    }

    if (countActiveTimeUnits === 2) {
      return index === 0 ? "left" : "right";
    }

    return activeTimeUnits[index].perspective;
  };

  if (countActiveTimeUnits === 0) {
    return null;
  }

  return (
    <Box
      className={styles.container}
      display="grid"
      gridTemplateColumns={`repeat(${countActiveTimeUnits}, 1fr)`}
    >
      {activeTimeUnits.map((unit, index) => (
        <IOSPickerItem
          key={index}
          slideCount={unit.slideCount}
          perspective={getAdjustedPerspective(index)}
          loop={loop}
          label=""
          step={unit.step}
          value={unit.value}
          onValueChange={unit.handler}
        />
      ))}
    </Box>
  );
};
