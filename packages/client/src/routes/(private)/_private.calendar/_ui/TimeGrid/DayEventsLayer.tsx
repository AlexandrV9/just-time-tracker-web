import styles from "./DayEventsLayer.module.css";
import { getHeight, getTop } from "./utils";
import { mockCalendarEvents } from "./constants";
import { useTranslation } from "~/shared/hooks";

type DayEventsLayerProps = {
  startHour: number;
  hourHeight: number;
};

export const DayEventsLayer = ({ hourHeight }: DayEventsLayerProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.eventsLayer}>
      {mockCalendarEvents.map((event) => {
        const top = getTop(event.startDate, 0, hourHeight);
        const height = getHeight(event.startDate, event.endDate, hourHeight);

        return (
          <div key={event.id} className={styles.event} style={{ top, height }}>
            <strong>{t(event.title)}</strong>
            <div className={styles.time}>
              {new Date(event.startDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" – "}
              {new Date(event.endDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
