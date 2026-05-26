export type GroupByDate = "day" | "week" | "month" | "year";

/**
 * Дата в формате: "YYYY-MM-DD"
 */
export type CalendarDay = string & { __brand: "CalendarDay" };
