import { pool } from "../../shared/index.js";
import {
  mapPushSubscriptionRow,
  type CreatePushSubscriptionInput,
  type PushSubscription,
  type PushSubscriptionRow,
} from "./notifications.types.js";

const SUBSCRIPTION_RETURNING_COLUMNS = `
  id,
  user_id AS "userId",
  endpoint,
  p256dh,
  auth,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const createSubscription = async (
  input: CreatePushSubscriptionInput,
): Promise<PushSubscription> => {
  const query = `
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (endpoint) DO UPDATE
    SET
      user_id = EXCLUDED.user_id,
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth,
      updated_at = NOW()
    RETURNING ${SUBSCRIPTION_RETURNING_COLUMNS}
  `;

  const { rows } = await pool.query(query, [
    input.userId,
    input.endpoint,
    input.p256dh,
    input.auth,
  ]);

  return mapPushSubscriptionRow(rows[0] as PushSubscriptionRow);
};

const findByUserId = async (userId: string): Promise<PushSubscription[]> => {
  const query = `
    SELECT ${SUBSCRIPTION_RETURNING_COLUMNS}
    FROM push_subscriptions
    WHERE user_id = $1
    ORDER BY created_at ASC
  `;

  const { rows } = await pool.query(query, [userId]);
  return rows.map((row) =>
    mapPushSubscriptionRow(row as PushSubscriptionRow),
  );
};

const findByEndpoint = async (
  endpoint: string,
): Promise<PushSubscription | null> => {
  const query = `
    SELECT ${SUBSCRIPTION_RETURNING_COLUMNS}
    FROM push_subscriptions
    WHERE endpoint = $1
  `;

  const { rows } = await pool.query(query, [endpoint]);
  return rows[0]
    ? mapPushSubscriptionRow(rows[0] as PushSubscriptionRow)
    : null;
};

const deleteByEndpoint = async (endpoint: string): Promise<boolean> => {
  const query = `
    DELETE FROM push_subscriptions
    WHERE endpoint = $1
  `;

  const result = await pool.query(query, [endpoint]);
  return (result.rowCount ?? 0) > 0;
};

const deleteById = async (id: string): Promise<boolean> => {
  const query = `
    DELETE FROM push_subscriptions
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return (result.rowCount ?? 0) > 0;
};

const deleteByUserId = async (userId: string): Promise<number> => {
  const query = `
    DELETE FROM push_subscriptions
    WHERE user_id = $1
  `;

  const result = await pool.query(query, [userId]);
  return result.rowCount ?? 0;
};

export const pushSubscriptionsRepository = {
  createSubscription,
  findByUserId,
  findByEndpoint,
  deleteByEndpoint,
  deleteById,
  deleteByUserId,
};
