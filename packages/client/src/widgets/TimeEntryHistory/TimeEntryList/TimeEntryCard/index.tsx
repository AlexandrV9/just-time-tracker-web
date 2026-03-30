import type { TimeEntryDTO } from "@to-do-list/shared";
import { useMemo } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  Button,
  Card,
  convertSecondsToTimeObject,
  convertTimeObjectToTimeString,
  EditIcon,
  Flex,
  IconButton,
  PlayIcon,
  Text,
  TrashIcon,
  type TimeObject,
} from "~/shared/ui";

import { format, type Locale } from "date-fns";
import { ru, enUS } from "date-fns/locale";

const locales: Record<string, Locale> = {
  ru: ru,
  en: enUS,
};

const intlLocales: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
};

interface FormatConfig {
  template: string;
  capitalize?: boolean;
}

const localeConfigs: Record<string, FormatConfig> = {
  ru: {
    template: "EEEE, d MMMM",
    capitalize: true,
  },
  en: {
    template: "EEEE, MMMM d",
  },
};

export function formatLocalizedDate(date: Date, language: string): string {
  const locale = locales[language];
  const config = localeConfigs[language] ?? localeConfigs.en;

  let result = format(date, config.template, { locale });

  if (config.capitalize) {
    result = result.charAt(0).toUpperCase() + result.slice(1);
  }

  return result;
}

export type TimeEntryCardProps = TimeEntryDTO & {
  onUpdate?: () => void;
  onDelete?: () => void;
};

const formatTime = (date: Date, locale: string) =>
  date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });

const getDurationInSeconds = (start: Date, end: Date): number => {
  return Math.floor((end.getTime() - start.getTime()) / 1000);
};

export const TimeEntryCard = ({
  title,
  startDate,
  endDate,
  onUpdate,
  onDelete,
}: TimeEntryCardProps) => {
  const { i18n } = useTranslation();
  const intlLocale = intlLocales[i18n.language] ?? intlLocales.en;

  const start = useMemo(() => new Date(startDate), [startDate]);
  const end = useMemo(() => new Date(endDate), [endDate]);

  const timeObject = useMemo((): TimeObject => {
    const seconds = getDurationInSeconds(start, end);
    return convertSecondsToTimeObject(seconds);
  }, [start, end]);

  const dateLabel = useMemo(
    () => formatLocalizedDate(start, i18n.language),
    [start, i18n.language],
  );

  const displayedTime = useMemo(() => {
    return convertTimeObjectToTimeString(timeObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeObject.hours, timeObject.minutes, timeObject.seconds]);

  const timeRange = useMemo(
    () => `${formatTime(start, intlLocale)} - ${formatTime(end, intlLocale)}`,
    [start, end, intlLocale],
  );

  return (
    <Card.Root>
      {/* <Flex gap={2}>
        {onDelete && (
          <IconButton size="md" ml="auto" variant="subtle" onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        )}
        {onUpdate && (
          <IconButton size="md" variant="subtle" onClick={onUpdate}>
            <EditIcon />
          </IconButton>
        )}
      </Flex> */}
      <Card.Body p={4} gap={2}>
        <Flex justifyContent="space-between">
          <Text textStyle="lg" fontWeight="bold">
            {title}
          </Text>
          <Text textStyle="lg" fontWeight="bold">
            {displayedTime}
          </Text>
        </Flex>
        <Flex justifyContent="space-between">
          <Text color="fg.muted" fontWeight="bold">
            {dateLabel}
          </Text>
          <Text color="fg.muted" fontWeight="bold">
            {timeRange}
          </Text>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};
