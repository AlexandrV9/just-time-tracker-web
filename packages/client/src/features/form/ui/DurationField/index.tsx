import { useMemo, type ChangeEvent } from "react";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToSeconds,
  convertTimeObjectToTimeString,
} from "~/shared/libs";
import { Field, Input } from "~/shared/ui";

export type DurationFieldProps = {
  label: string;
  valueSeconds: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
  hint?: string;
};

const secondsToTimeInputValue = (valueSeconds: number) =>
  convertTimeObjectToTimeString(convertSecondsToTimeObject(valueSeconds));

const timeInputValueToSeconds = (value: string) => {
  const [hours = 0, minutes = 0, seconds = 0] = value.split(":").map(Number);
  return convertTimeObjectToSeconds({ hours, minutes, seconds });
};

export const DurationField = ({
  label,
  valueSeconds,
  onChange,
  disabled,
  hint,
}: DurationFieldProps) => {
  const timeValue = useMemo(
    () => secondsToTimeInputValue(valueSeconds),
    [valueSeconds],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (!nextValue) return;

    onChange(timeInputValueToSeconds(nextValue));
  };

  return (
    <Field.Root>
      <Field.Label color="fg">{label}</Field.Label>
      {hint && (
        <Field.HelperText color="fg.muted" mb={1}>
          {hint}
        </Field.HelperText>
      )}
      <Input
        type="time"
        step={1}
        width="110px"
        value={timeValue}
        onChange={handleChange}
        disabled={disabled}
        fontFamily="Roboto Mono, monospace"
        css={{
          appearance: "none",
          "&::-webkit-calendar-picker-indicator": {
            display: "none",
            appearance: "none",
          },
        }}
      />
    </Field.Root>
  );
};
