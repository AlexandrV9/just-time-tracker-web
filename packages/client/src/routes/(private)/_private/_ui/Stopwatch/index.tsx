import clsx from "clsx";
import {
  Button,
  formatSecondsAsTimeString,
  PauseIcon,
  PlayIcon,
  StopCircleIcon,
  Text,
} from "~/shared/ui";
import { useCurrentActivity } from "~/features";
import { useTranslation } from "~/shared/hooks";

import styles from "./Stopwatch.module.css";

type StopwatchProps = {
  collapsed?: boolean;
};

export function Stopwatch({ collapsed = false }: StopwatchProps) {
  const { t } = useTranslation();

  const {
    currentActivity,
    currentSession,
    status,
    displayedSeconds,
    start,
    pause,
    finish,
  } = useCurrentActivity();

  const displayedTitle = currentActivity?.title;
  const displayedTime = formatSecondsAsTimeString(displayedSeconds);

  const hasActivity = Boolean(currentActivity);
  const isActive = status === "active";
  const canStop = Boolean(currentSession);

  return (
    <div className={clsx(styles.container, collapsed && styles.collapsed)}>
      <div className={styles.title} data-flip="title">
        <Text
          textStyle="sm"
          color={displayedTitle ? "fg.muted" : "fg.subtle"}
          lineClamp={1}
        >
          {displayedTitle ?? t("pages.home.selectActivity")}
        </Text>
      </div>
      <div className={styles.time} data-flip="time">
        {displayedTime}
      </div>
      <div className={styles.stop} data-flip="stop">
        <Button
          variant="subtle"
          borderRadius="0.5rem"
          w="full"
          h="full"
          minW="0"
          px="0"
          disabled={!canStop}
          onClick={() => finish()}
        >
          <StopCircleIcon className={styles.icon} />
        </Button>
      </div>
      <div className={styles.play} data-flip="play">
        <Button
          borderRadius="0.5rem"
          w="full"
          h="full"
          minW="0"
          px="0"
          disabled={!hasActivity}
          onClick={() => (isActive ? pause() : start())}
        >
          {isActive ? (
            <PauseIcon className={styles.icon} />
          ) : (
            <PlayIcon className={styles.icon} />
          )}
        </Button>
      </div>
    </div>
  );
}
