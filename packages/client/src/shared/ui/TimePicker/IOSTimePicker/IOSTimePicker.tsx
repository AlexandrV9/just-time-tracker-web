import type { EmblaOptionsType } from "embla-carousel";

import styles from "./IOSTimePicker.module.css";

import { IOSPickerItem } from "./IOSPickerItem";
import { Box } from "../../Box";

export type IOSTimeTimeUnit = {
  value?: number;
  handler?: (value: number) => void;
  slideCount: number;
  perspective: "left" | "center" | "right";
  max?: number;
  min?: number;
};

export type IOSTimePickerProps = {
  loop?: EmblaOptionsType["loop"];

  // hours
  hours?: number;
  onChangeHours?: (value: number) => void;
  // minHours?: number;
  // maxHours?: number;

  // minutes
  minutes?: number;
  onChangeMinutes?: (value: number) => void;
  // maxMinutes?: number;
  // minMinutes?: number;

  // seconds
  seconds?: number;
  onChangeSeconds?: (value: number) => void;
  // minSeconds?: number;
  // maxSeconds?: number;
};

export const IOSTimePicker = ({
  loop,
  onChangeHours,
  hours,
  // minHours = 0,
  // maxHours = 23,
  onChangeMinutes,
  minutes,
  // minMinutes = 0,
  // maxMinutes = 59,
  onChangeSeconds,
  seconds,
}: // minSeconds = 0,
// maxSeconds = 59,
IOSTimePickerProps) => {
  const allTimeUnits: IOSTimeTimeUnit[] = [
    {
      value: hours,
      handler: onChangeHours,
      slideCount: 24,
      perspective: "left",
      // min: minHours,
      // max: maxHours,
    },
    {
      value: minutes,
      handler: onChangeMinutes,
      slideCount: 60,
      perspective: "center",
      // min: minMinutes,
      // max: maxMinutes,
    },
    {
      value: seconds,
      handler: onChangeSeconds,
      slideCount: 60,
      perspective: "right",
      // min: minSeconds,
      // max: maxSeconds,
    },
  ];
  const activeTimeUnits = allTimeUnits.filter((unit) => unit.handler);
  const countActiveTimeUnits = activeTimeUnits.length;

  const getAdjustedPerspective = (index: number) => {
    if (countActiveTimeUnits === 1) return "center" as const;
    if (countActiveTimeUnits === 2) return index === 0 ? "left" : "right";
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
          value={unit.value}
          onValueChange={unit.handler}
        />
      ))}
    </Box>
  );
};
