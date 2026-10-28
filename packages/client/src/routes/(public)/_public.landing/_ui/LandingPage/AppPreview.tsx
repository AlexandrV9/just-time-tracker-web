import { useEffect, useState } from "react";
import { useTranslation } from "~/shared/hooks";
import {
  ArrowRightIcon,
  BellIcon,
  Calendar2Icon,
  ChartLineIcon,
  CheckIcon,
  ClockIcon,
  LightningIcon,
  PlayIcon,
  Brand,
  MetricCard,
  Surface,
  PanelHeading,
  StatusBadge,
  TimerDial,
  SessionControls,
  ActivityRow,
  ActionButton,
  BarChart,
} from "~/shared/ui";
import styles from "./LandingPage.module.css";

const activities = ["work", "reading", "learning"] as const;
const initialTimes = [2_538_000, 1_500_000, 1_020_000];
const bars = [36, 60, 45, 79, 55, 91, 68];

export function AppPreview() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const [clock, setClock] = useState({
    elapsedMs: initialTimes[0],
    startedAt: 0,
  });
  const [now, setNow] = useState(0);
  const running = clock.startedAt > 0;
  const seconds = Math.floor(
    (clock.elapsedMs + (running ? Math.max(0, now - clock.startedAt) : 0)) /
      1000,
  );
  const time = [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [running]);

  const toggle = () => {
    const timestamp = Date.now();
    setNow(timestamp);
    setClock((previous) =>
      previous.startedAt
        ? {
            elapsedMs: previous.elapsedMs + timestamp - previous.startedAt,
            startedAt: 0,
          }
        : { ...previous, startedAt: timestamp },
    );
  };

  const select = (index: number) => {
    if (index === selected) return;
    setSelected(index);
    setClock({ elapsedMs: initialTimes[index], startedAt: 0 });
  };

  return (
    <div
      className={styles.dashboard}
      data-density="compact"
      aria-label={t("pages.landing.design.demoLabel")}
    >
      <aside className={styles.dashboardSide}>
        <div className={styles.dashboardBrand}>
          <Brand compact />
        </div>
        <div className={styles.dashboardNav} aria-hidden="true">
          <span className={styles.dashboardNavActive}>
            <ClockIcon size={17} />
            {t("pages.landing.design.timerLabel")}
          </span>
          <span>
            <Calendar2Icon size={17} />
            {t("pages.landing.design.planLabel")}
          </span>
          <span>
            <LightningIcon size={17} />
            {t("pages.landing.design.activitiesLabel")}
          </span>
          <span>
            <ChartLineIcon size={17} />
            {t("pages.landing.design.insightsLabel")}
          </span>
        </div>
        <div className={styles.sideNote}>
          <span className={styles.sideNoteIcon}>✧</span>
          <p>{t("pages.landing.design.sideNote")}</p>
        </div>
        <span className={styles.dashboardDemo}>
          <i />
          {t("pages.landing.design.demoBadge")}
        </span>
      </aside>
      <div className={styles.dashboardMain}>
        <div className={styles.dashboardTop}>
          <div>
            <span className={styles.greeting}>
              {t("pages.landing.design.previewGreeting")}
            </span>
            <h2>{t("pages.landing.design.previewHeading")}</h2>
          </div>
          <span className={styles.previewLive}>
            <i />
            {t("pages.landing.design.livePreview")}
          </span>
        </div>
        <div className={styles.metrics}>
          <MetricCard
            label={t("pages.landing.design.dailyFocus")}
            value={t("pages.landing.design.dailyTime")}
            icon={<ClockIcon size={20} />}
          />
          <MetricCard
            label={t("pages.landing.design.activitiesLabel")}
            value="3 / 5"
            icon={<LightningIcon size={20} />}
            tone="mint"
          />
          <MetricCard
            label={t("pages.landing.design.sessionsLabel")}
            value="4"
            icon={<CheckIcon size={20} />}
            tone="blue"
          />
        </div>
        <div className={styles.dashboardGrid}>
          <Surface>
            <PanelHeading
              title={t("pages.landing.design.currentSession")}
              action={
                <StatusBadge tone={running ? "mint" : "muted"}>
                  {t(
                    running
                      ? "pages.landing.design.running"
                      : "pages.landing.design.paused",
                  )}
                </StatusBadge>
              }
            />
            <TimerDial
              compact
              title={t(
                `pages.landing.design.activities.${activities[selected]}`,
              )}
              time={time}
              label={t("pages.landing.design.elapsed")}
              caption={t("pages.landing.design.focusCaption")}
              progress={seconds / 54}
            />
            <SessionControls
              running={running}
              onToggle={toggle}
              onFinish={() => setClock({ elapsedMs: 0, startedAt: 0 })}
              playLabel={t("pages.landing.design.play")}
              pauseLabel={t("pages.landing.design.pause")}
              finishLabel={t("pages.landing.design.reset")}
            />
          </Surface>
          <div className={styles.previewRight}>
            <Surface>
              <PanelHeading
                title={t("pages.landing.design.planLabel")}
                action={<small>03</small>}
              />
              <div
                className={styles.activityList}
                role="group"
                aria-label={t("pages.landing.design.selectActivity")}
              >
                {activities.map((name, index) => (
                  <ActivityRow
                    key={name}
                    title={t(`pages.landing.design.activities.${name}`)}
                    time={["01:30:00", "00:25:00", "00:45:00"][index]}
                    selected={selected === index}
                    tone={
                      index === 1 ? "mint" : index === 2 ? "blue" : "purple"
                    }
                    onSelect={() => select(index)}
                    actions={
                      <ActionButton
                        compact
                        tone="ghost"
                        aria-label={t(
                          `pages.landing.design.activities.${name}`,
                        )}
                        onClick={() => select(index)}
                      >
                        <PlayIcon size={13} />
                      </ActionButton>
                    }
                  />
                ))}
              </div>
            </Surface>
            <Surface>
              <PanelHeading title={t("pages.landing.design.weekLabel")} />
              <BarChart
                label={t("pages.landing.design.dailyFocus")}
                data={bars.map((value, index) => ({
                  value,
                  label: t(`pages.landing.design.weekdays.${index}`),
                  description: `${t(`pages.landing.design.weekdays.${index}`)}: ${value}`,
                  highlighted: index === 5,
                }))}
              />
            </Surface>
          </div>
        </div>
        <div className={styles.dashboardBottom}>
          <BellIcon size={13} aria-hidden="true" />
          <span>{t("pages.landing.design.previewTip")}</span>
          <ArrowRightIcon size={13} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
