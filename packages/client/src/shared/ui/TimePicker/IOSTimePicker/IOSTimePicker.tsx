import type { EmblaOptionsType } from "embla-carousel";

import styles from "./IOSTimePicker.module.css";

import { IOSPickerItem } from "./IOSPickerItem";
import { Box } from "../../Box";

export type IOSTimeTimeUnit = {
  value?: number;
  handler?: (value: number) => void;
  slideCount: number;
  perspective: "left" | "center" | "right";
};

export type IOSTimePickerProps = {
  loop?: EmblaOptionsType["loop"];
  hours?: number;
  minutes?: number;
  seconds?: number;
  onChangeHours?: (value: number) => void;
  onChangeMinutes?: (value: number) => void;
  onChangeSeconds?: (value: number) => void;
};

export const IOSTimePicker = ({
  loop,
  hours,
  minutes,
  seconds,
  onChangeHours,
  onChangeMinutes,
  onChangeSeconds,
}: IOSTimePickerProps) => {
  const allTimeUnits: IOSTimeTimeUnit[] = [
    {
      value: hours,
      handler: onChangeHours,
      slideCount: 24,
      perspective: "left",
    },
    {
      value: minutes,
      handler: onChangeMinutes,
      slideCount: 60,
      perspective: "center",
    },
    {
      value: seconds,
      handler: onChangeSeconds,
      slideCount: 60,
      perspective: "right",
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
