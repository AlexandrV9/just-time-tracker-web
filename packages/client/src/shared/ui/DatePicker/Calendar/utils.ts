import dayjs from "dayjs";

export const getDateString = (date: Date, template: string = "DD/MM/YYYY") => {
  return dayjs(date).format(template);
};
