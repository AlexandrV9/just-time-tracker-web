import { useMemo, useState, type ChangeEvent } from "react";
import { Field, Input } from "~/shared/ui";
import {
  prefersTouchDurationPicker,
  secondsToTimeInputValue,
  timeInputValueToSeconds,
} from "../../utils/duration";
import { TouchDurationPicker } from "../TouchDurationPicker";

export type DurationFieldProps = {
  label: string;
  valueSeconds: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
  hint?: string;
};

export const DurationField = ({
  label,
  valueSeconds,
  onChange,
  disabled,
  hint,
}: DurationFieldProps) => {
  const [useTouchPicker] = useState(prefersTouchDurationPicker);

  const timeValue = useMemo(
    () => secondsToTimeInputValue(valueSeconds),
    [valueSeconds],
  );

  const handleNativeChange = (event: ChangeEvent<HTMLInputElement>) => {
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

      {useTouchPicker ? (
        <TouchDurationPicker
          valueSeconds={valueSeconds}
          onChange={onChange}
          disabled={disabled}
        />
      ) : (
        <Input
          type="time"
          step={1}
          width="110px"
          value={timeValue}
          onChange={handleNativeChange}
          disabled={disabled}
          fontFamily="Roboto Mono, monospace"
        />
      )}
    </Field.Root>
  );
};
