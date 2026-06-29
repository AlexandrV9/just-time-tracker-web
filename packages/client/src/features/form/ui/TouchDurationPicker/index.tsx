import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  convertSecondsToTimeObject,
  convertTimeObjectToSeconds,
} from "~/shared/libs";
import {
  Badge,
  Button,
  Dialog,
  IOSTimePicker,
  Portal,
  useTimePicker,
} from "~/shared/ui";
import { secondsToTimeInputValue } from "../../utils/duration";

const baseLocale = "common.durationField";

export type TouchDurationPickerProps = {
  valueSeconds: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
};

export const TouchDurationPicker = ({
  valueSeconds,
  onChange,
  disabled,
}: TouchDurationPickerProps) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const draftSecondsRef = useRef(valueSeconds);

  const timeValue = useMemo(
    () => secondsToTimeInputValue(valueSeconds),
    [valueSeconds],
  );

  const { time, setHours, setMinutes, setSeconds, setTime } = useTimePicker(
    convertSecondsToTimeObject(valueSeconds),
  );

  const handleOpenModal = useCallback(() => {
    if (disabled) return;

    draftSecondsRef.current = valueSeconds;
    setTime(convertSecondsToTimeObject(valueSeconds));
    setIsModalOpen(true);
  }, [disabled, setTime, valueSeconds]);

  const handleCancel = useCallback(() => {
    setTime(convertSecondsToTimeObject(draftSecondsRef.current));
    setIsModalOpen(false);
  }, [setTime]);

  const handleConfirm = useCallback(() => {
    onChange(convertTimeObjectToSeconds(time));
    setIsModalOpen(false);
  }, [onChange, time]);

  const handleModalOpenChange = useCallback(
    (details: { open: boolean }) => {
      if (details.open) return;

      handleCancel();
    },
    [handleCancel],
  );

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpenModal}
        aria-haspopup="dialog"
        aria-expanded={isModalOpen}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Badge
          size="lg"
          border="1px solid transparent"
          fontFamily="Roboto Mono, monospace"
          w="fit-content"
        >
          {timeValue}
        </Badge>
      </button>

      <Dialog.Root
        open={isModalOpen}
        onOpenChange={handleModalOpenChange}
        placement="center"
        size="md"
        lazyMount
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="sm" w="full" mx={4} borderRadius="xl">
              <Dialog.Body
                display="flex"
                flexDirection="column"
                alignItems="center"
                py={6}
              >
                <IOSTimePicker
                  loop
                  hours={time.hours}
                  minutes={time.minutes}
                  seconds={time.seconds}
                  onChangeHours={setHours}
                  onChangeMinutes={setMinutes}
                  onChangeSeconds={setSeconds}
                />
              </Dialog.Body>

              <Dialog.Footer
                display="flex"
                gap={3}
                justifyContent="flex-end"
                p={4}
                borderTop="1px solid"
                borderColor="border.emphasized"
              >
                <Button variant="outline" onClick={handleCancel}>
                  {t(`${baseLocale}.cancelButton`)}
                </Button>
                <Button onClick={handleConfirm}>
                  {t(`${baseLocale}.confirmButton`)}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};
