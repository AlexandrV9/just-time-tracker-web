import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Calendar, Dialog, Flex, Stack, Text } from "~/shared/ui";
import { PrevTrigger } from "./PrevTrigger";
import { NextTrigger } from "./NextTrigger";
import { getSunday, getWeekdayLabel, getWeekDays } from "./utils";
import { Portal, useDialog } from "@ark-ui/react";
import { ButtonGroup } from "@chakra-ui/react";
import { useTranslation } from "~/shared/hooks";

type DateNavigatorProps = {
  value?: Date | null;
  onChange?: (date: Date) => void;
};

export function DateNavigator({ value, onChange }: DateNavigatorProps) {
  const { t, i18n } = useTranslation();

  const currentDate = dayjs(value);

  const [date, setDate] = useState(() => dayjs(value));

  const selectDateDialog = useDialog();

  const [weekAnchor, setWeekAnchor] = useState(() =>
    getSunday(value ? dayjs(value) : dayjs())
  );

  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);

  const handleSelectDate = useCallback(
    (day: Dayjs) => {
      onChange?.(day.toDate());
    },
    [onChange]
  );

  const handleClickPrevTrigger = useCallback(() => {
    setWeekAnchor((w) => w.subtract(7, "day"));
  }, []);

  const handleClickNextTrigger = useCallback(() => {
    setWeekAnchor((w) => w.add(7, "day"));
  }, []);

  useEffect(() => {
    setDate(currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate.toISOString()]);

  return (
    <Stack.VStack justify="center">
      <Flex
        w="full"
        position="relative"
        justify="center"
        align="center"
        minH={10}
        gap={3}
      >
        <PrevTrigger
          onClick={handleClickPrevTrigger}
          position="absolute"
          left={0}
        />
        <Dialog.RootProvider size="xs" value={selectDateDialog}>
          <Dialog.Trigger asChild>
            <Button
              variant="outline"
              size="sm"
              borderRadius="2rem"
              bg="bg.muted"
            >
              <Text fontWeight="semibold" textTransform="capitalize">
                {date.locale(i18n.language).format("MMMM YYYY")}
              </Text>
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header justifyContent="center">
                  <Dialog.Title>
                    {t("pages.calendar.goToDateDialogTitle")}
                  </Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Calendar />
                </Dialog.Body>
                <Dialog.Footer>
                  <ButtonGroup
                    display="grid"
                    gridTemplateColumns="1fr 1fr"
                    gap="0.5rem"
                    w="full"
                  >
                    <Button
                      variant="outline"
                      w="full"
                      onClick={() => selectDateDialog.setOpen(false)}
                    >
                      {t("pages.calendar.dialogCancel")}
                    </Button>
                    <Button variant="solid" w="full">
                      {t("pages.calendar.dialogApply")}
                    </Button>
                  </ButtonGroup>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.RootProvider>
        <NextTrigger
          onClick={handleClickNextTrigger}
          position="absolute"
          right={0}
        />
      </Flex>
      <Flex gap={2} w="full" justifyContent="space-between">
        {weekDays.map((day) => {
          const isSelected = value ? dayjs(value).isSame(day, "day") : false;
          const isToday = day.isSame(dayjs(), "day");

          return (
            <Stack.VStack
              key={day.toString()}
              gap={3}
              bg={isSelected ? "gray.emphasized" : "bg.muted"}
              borderRadius="full"
              p="5px"
            >
              <Text textAlign="center" textStyle="lg" color="gray.400">
                {getWeekdayLabel(day)}
              </Text>
              <Box
                as="button"
                w="32px"
                h="32px"
                borderRadius="full"
                display="grid"
                placeItems="center"
                fontWeight="medium"
                bg={isSelected ? "#ffffff" : "bg.emphasized"}
                color={isSelected ? "black" : "#ffffff"}
                outline={isToday ? "2px solid" : "none"}
                outlineColor="#0cd3fba8"
                onClick={() => handleSelectDate(day)}
                _hover={{
                  cursor: "pointer",
                }}
              >
                {day.date()}
              </Box>
            </Stack.VStack>
          );
        })}
      </Flex>
    </Stack.VStack>
  );
}
