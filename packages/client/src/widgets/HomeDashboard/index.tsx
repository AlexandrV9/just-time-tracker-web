import { useState } from "react";
import {
  useCurrentActivity,
  useDayDisplayedSeconds,
} from "~/features/activity";
import { useAuthStore } from "~/features/auth";
import { useTranslation } from "~/shared/hooks";
import { getCalendarDay, getDateIntervalByCalendarDay } from "~/shared/libs";
import { STOPWATCH_COLLAPSED_KEY } from "~/shared/constants";
import {
  BellIcon,
  Calendar2Icon,
  ChartLineIcon,
  ClockIcon,
  LightningIcon,
  Link,
  MetricCard,
  PanelHeading,
  Surface,
  BarChart,
  StatusBadge,
  DesignEmptyState,
  Skeleton,
  formatSecondsAsTimeString,
} from "~/shared/ui";
import { useTodayActivities } from "../TodayActivityList/useTodayActivities";
import { useTodayPlanItems } from "../TodayActivityList/useTodayActivities/useTodayPlanItems";
import { TodayActivityList } from "../TodayActivityList";
import { CurrentSession } from "./CurrentSession";
import { useDashboardWeek } from "./useDashboardWeek";
import styles from "./HomeDashboard.module.css";

export function HomeDashboard() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { currentSegment, status } = useCurrentActivity();
  const { activityGroup, isLoading, isError } = useTodayActivities();
  const {
    todayPlanItems,
    isLoading: planLoading,
    isError: planError,
  } = useTodayPlanItems();
  const week = useDashboardWeek();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STOPWATCH_COLLAPSED_KEY) === "1",
  );
  const { fromDate } = getDateIntervalByCalendarDay(getCalendarDay());
  const daySeconds = useDayDisplayedSeconds({
    activeDurationMs: activityGroup.totalActiveTime * 1000,
    hasActiveSession: status === "active" && currentSegment?.type === "active",
    startedAt: currentSegment?.startedAt,
    liveElapsedClipFromIso: fromDate,
  });
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STOPWATCH_COLLAPSED_KEY, next ? "1" : "0");
  };
  const metricValue = (
    value: string | number,
    loading = isLoading,
    error = isError,
  ) => (loading ? <Skeleton height="7" width="80px" /> : error ? "—" : value);
  const chartData = week.days.map(({ date, activeSeconds }, index) => ({
    value: activeSeconds,
    label: new Intl.DateTimeFormat(i18n.language, {
      weekday: "short",
      timeZone: "UTC",
    }).format(date),
    description: `${new Intl.DateTimeFormat(i18n.language, { dateStyle: "short", timeZone: "UTC" }).format(date)}: ${formatSecondsAsTimeString(activeSeconds)}`,
    highlighted: index === 6,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <p>
            {user?.name
              ? t("pages.dashboard.greeting", { name: user.name })
              : t("pages.dashboard.welcome")}
          </p>
          <h1>{t("pages.dashboard.title")}</h1>
        </div>
        <StatusBadge tone={status === "active" ? "mint" : "muted"}>
          {new Intl.DateTimeFormat(i18n.language, {
            day: "numeric",
            month: "long",
          }).format(new Date())}
        </StatusBadge>
      </div>
      <div className={styles.metrics}>
        <MetricCard
          label={t("pages.dashboard.focus")}
          value={metricValue(formatSecondsAsTimeString(daySeconds))}
          icon={<ClockIcon size={21} />}
        />
        <MetricCard
          label={t("pages.dashboard.activities")}
          value={metricValue(activityGroup.activities.length)}
          icon={<LightningIcon size={21} />}
          tone="mint"
        />
        <MetricCard
          label={t("pages.dashboard.planned")}
          value={metricValue(todayPlanItems.length, planLoading, planError)}
          icon={<Calendar2Icon size={21} />}
          tone="blue"
        />
      </div>
      <div className={styles.grid}>
        <CurrentSession
          daySeconds={daySeconds}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />
        <div className={styles.right}>
          <Surface>
            <TodayActivityList variant="rows" />
          </Surface>
          <Surface>
            <PanelHeading
              title={t("pages.dashboard.week")}
              action={<span className={styles.timezone}>UTC</span>}
            />
            {week.isLoading ? (
              <Skeleton height="140px" />
            ) : week.isError ? (
              <DesignEmptyState>
                {t("pages.dashboard.weekError")}
              </DesignEmptyState>
            ) : (
              <>
                <BarChart data={chartData} label={t("pages.dashboard.focus")} />
                {!week.days.some((day) => day.activeSeconds > 0) && (
                  <p className={styles.chartNote}>
                    {t("pages.dashboard.weekEmpty")}
                  </p>
                )}
              </>
            )}
            <Link to="/history" className={styles.historyLink}>
              <ChartLineIcon size={13} aria-hidden="true" />
              {t("pages.dashboard.openHistory")}
            </Link>
          </Surface>
        </div>
      </div>
      <p className={styles.tip}>
        <BellIcon size={14} aria-hidden="true" />
        {t("pages.dashboard.tip")}
      </p>
    </div>
  );
}
