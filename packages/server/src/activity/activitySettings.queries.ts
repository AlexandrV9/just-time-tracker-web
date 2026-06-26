import type { ActivitySettingsDTO } from "@time-tracker/shared";
import { DEFAULT_ACTIVITY_SETTINGS } from "@time-tracker/shared";
import { pool } from "../shared/index.js";

export type ActivitySettingsRow = {
  activityId: string;
  sessionGoalSeconds: number;
  notifyOnGoalReached: boolean;
  notifyOnLongPause: boolean;
  longPauseThresholdSeconds: number;
  notifyOnLongActivity: boolean;
  longActivityThresholdSeconds: number;
  createdAt: string;
  updatedAt: string;
};

const RETURNING_COLUMNS = `
  activity_id AS "activityId",
  session_goal_seconds AS "sessionGoalSeconds",
  notify_on_goal_reached AS "notifyOnGoalReached",
  notify_on_long_pause AS "notifyOnLongPause",
  long_pause_threshold_seconds AS "longPauseThresholdSeconds",
  notify_on_long_activity AS "notifyOnLongActivity",
  long_activity_threshold_seconds AS "longActivityThresholdSeconds",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export const mapActivitySettingsRow = (
  row: ActivitySettingsRow,
): ActivitySettingsDTO => ({
  sessionGoalSeconds: row.sessionGoalSeconds,
  notifyOnGoalReached: row.notifyOnGoalReached,
  notifyOnLongPause: row.notifyOnLongPause,
  longPauseThresholdSeconds: row.longPauseThresholdSeconds,
  notifyOnLongActivity: row.notifyOnLongActivity,
  longActivityThresholdSeconds: row.longActivityThresholdSeconds,
});

const getDefaultSettings = (): ActivitySettingsDTO => ({
  ...DEFAULT_ACTIVITY_SETTINGS,
});

const getByActivityId = async (
  activityId: string,
): Promise<ActivitySettingsDTO | null> => {
  const query = `
    SELECT ${RETURNING_COLUMNS}
    FROM activity_settings
    WHERE activity_id = $1
  `;

  const { rows } = await pool.query(query, [activityId]);
  const row = rows[0] as ActivitySettingsRow | undefined;
  return row ? mapActivitySettingsRow(row) : null;
};

const getByActivityIdOrDefault = async (
  activityId: string,
): Promise<ActivitySettingsDTO> => {
  const settings = await getByActivityId(activityId);
  return settings ?? getDefaultSettings();
};

const upsert = async (
  activityId: string,
  settings: ActivitySettingsDTO,
): Promise<ActivitySettingsDTO> => {
  const query = `
    INSERT INTO activity_settings (
      activity_id,
      session_goal_seconds,
      notify_on_goal_reached,
      notify_on_long_pause,
      long_pause_threshold_seconds,
      notify_on_long_activity,
      long_activity_threshold_seconds
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (activity_id) DO UPDATE
    SET
      session_goal_seconds = EXCLUDED.session_goal_seconds,
      notify_on_goal_reached = EXCLUDED.notify_on_goal_reached,
      notify_on_long_pause = EXCLUDED.notify_on_long_pause,
      long_pause_threshold_seconds = EXCLUDED.long_pause_threshold_seconds,
      notify_on_long_activity = EXCLUDED.notify_on_long_activity,
      long_activity_threshold_seconds = EXCLUDED.long_activity_threshold_seconds,
      updated_at = NOW()
    RETURNING ${RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    activityId,
    settings.sessionGoalSeconds,
    settings.notifyOnGoalReached,
    settings.notifyOnLongPause,
    settings.longPauseThresholdSeconds,
    settings.notifyOnLongActivity,
    settings.longActivityThresholdSeconds,
  ]);

  return mapActivitySettingsRow(rows[0] as ActivitySettingsRow);
};

const insertDefaults = async (activityId: string): Promise<void> => {
  await upsert(activityId, getDefaultSettings());
};

export const activitySettingsQueries = {
  getByActivityId,
  getByActivityIdOrDefault,
  upsert,
  insertDefaults,
};
