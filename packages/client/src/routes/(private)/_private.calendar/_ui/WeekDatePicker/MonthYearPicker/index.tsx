import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState, type ReactElement } from "react";
import { Popover } from "@chakra-ui/react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Portal,
  Stack,
  Text,
} from "~/shared/ui";
import { Z_INDEX } from "~/shared/constants/zIndex";

import styles from "./MonthYearPicker.module.css";
import { ArrowNavButton } from "../ArrowButtonTrigger";

type MonthYearPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Дата, определяющая подсвеченный месяц и год (выбранный день или середина недели). */
  value: Dayjs;
  locale: string;
  onSelect: (date: Dayjs) => void;
  /** Элемент-триггер: попап сам навешивает на него обработчики. */
  children: ReactElement;
};

function getMonthLabels(locale: string): string[] {
  return Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat(locale, { month: "short" }).format(
      new Date(2020, month, 1),
    ),
  );
}

/**
 * Попап выбора месяца и года. Возвращает первое число выбранного месяца.
 *
 * Год редактируется черновиком: пока пользователь листает года стрелками,
 * `value` не меняется — выбор применяется только по клику на месяц.
 */
export function MonthYearPicker({
  open,
  onOpenChange,
  value,
  locale,
  onSelect,
  children,
}: MonthYearPickerProps) {
  const [draftYear, setDraftYear] = useState(value.year());

  const monthLabels = useMemo(() => getMonthLabels(locale), [locale]);

  const selectedMonth = value.month();
  const selectedYear = value.year();

  const handleOpenChange = (details: { open: boolean }) => {
    // При каждом открытии сбрасываем черновик года на актуальный.
    if (details.open) {
      setDraftYear(value.year());
    }
    onOpenChange(details.open);
  };

  const handleSelectMonth = (month: number) => {
    onSelect(dayjs().year(draftYear).month(month).date(1).startOf("day"));
    onOpenChange(false);
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={handleOpenChange}
      positioning={{ placement: "bottom", offset: { mainAxis: 8 } }}
      lazyMount
      unmountOnExit
    >
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Portal>
        {open && (
          <Box
            className={styles.backdrop}
            style={{ zIndex: Z_INDEX.popoverBackdrop }}
            aria-hidden
            onClick={() => onOpenChange(false)}
          />
        )}
        <Popover.Positioner style={{ zIndex: Z_INDEX.popoverContent }}>
          <Popover.Content
            className={styles.panel}
            w="min(320px, calc(100vw - 2rem))"
            p="1rem"
            borderRadius="2xl"
            zIndex="popover"
          >
            <Popover.Body p="0">
              <Flex
                alignItems="center"
                justifyContent="center"
                gap="0.5rem"
                mb="1rem"
                minH="32px"
              >
                <Stack.HStack
                  alignItems="center"
                  justifyContent="space-between"
                  gap="0.35rem"
                  w="full"
                >
                  <ArrowNavButton
                    direction="left"
                    aria-label="Previous year"
                    onClick={() => setDraftYear((y) => y - 1)}
                  />
                  <Text
                    textStyle="md"
                    fontWeight="semibold"
                    color="fg"
                    truncate
                  >
                    {draftYear}
                  </Text>
                  <ArrowNavButton
                    direction="right"
                    aria-label="Previous year"
                    onClick={() => setDraftYear((y) => y + 1)}
                  />
                </Stack.HStack>
              </Flex>
              <Grid as="ul" templateColumns="repeat(3, 1fr)" gap="0.5rem">
                {monthLabels.map((label, month) => {
                  const isSelected =
                    month === selectedMonth && draftYear === selectedYear;

                  return (
                    <Box as="li" key={month}>
                      <Button
                        w="full"
                        py="0.65rem"
                        px="0.25rem"
                        borderRadius="lg"
                        textAlign="center"
                        textStyle="sm"
                        fontWeight={isSelected ? "bold" : "medium"}
                        textTransform="capitalize"
                        color={isSelected ? "purple.focusRing" : "fg"}
                        bg={isSelected ? "bg.muted" : "transparent"}
                        onClick={() => handleSelectMonth(month)}
                        _hover={{
                          cursor: "pointer",
                          bg: "bg.muted",
                        }}
                      >
                        {label}
                      </Button>
                    </Box>
                  );
                })}
              </Grid>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
