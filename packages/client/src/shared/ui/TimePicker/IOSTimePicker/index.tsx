import type { EmblaOptionsType } from "embla-carousel";

import styles from "./IOSTimePicker.module.css";

import { IOSPickerItem } from "./IOSPickerItem";
import { useState } from "react";

type IOSTimePickerProps = {
  loop?: EmblaOptionsType["loop"];
};

export const IOSTimePicker = ({ loop }: IOSTimePickerProps) => {
  const [selectedHour, setSelectedHour] = useState(0);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const handleHourChange = (hour: number) => {
    console.log("Selected hour:", hour);
    setSelectedHour(hour);
  };

  const handleMinuteChange = (minute: number) => {
    console.log("Selected minute:", minute);
    setSelectedMinute(minute);
  };

  console.log(selectedHour, selectedMinute)

  return (
    <div className={styles.container}>
      <IOSPickerItem
        slideCount={24}
        perspective="left"
        loop={loop}
        label="ч"
        onValueChange={handleHourChange}
      />
      <IOSPickerItem
        slideCount={60}
        perspective="right"
        loop={loop}
        label="мин"
        onValueChange={handleMinuteChange}
      />
    </div>
  );
};
