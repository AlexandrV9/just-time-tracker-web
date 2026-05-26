import { useContext } from "react";
import { CalendarContext } from "./context";

export { CalendarProvider } from "./provider";

export const useCalendar = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("CalendarProvider not found");
  }

  return context;
};
