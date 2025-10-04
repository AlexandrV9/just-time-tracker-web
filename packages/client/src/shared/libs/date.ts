import dayjs from "dayjs";

import "dayjs/locale/ru";
import "dayjs/locale/en";

export type Locale = "ru" | "en";

dayjs.locale("ru");

export const setDayjsLocale = (locale: Locale) => {
  dayjs.locale(locale);
};

  // const formatter = new Intl.DateTimeFormat(locale, {
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // });

export const formatDate = (
  date: Date,
  template = "DD.MM.YYYY",
  locale?: Locale
): string => {
  let dayjsInstance = dayjs(date);

  if (locale) {
    dayjsInstance = dayjsInstance.locale(locale);
  }

  return dayjsInstance.format(template);
};
