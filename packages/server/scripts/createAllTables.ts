import { pool } from "src/shared/index.js";
import { ensureDatabase } from "./ensureDatabase.js";
import { isMainModule } from "./isMainModule.js";
import { createUsersTable } from "./createUsersTable.js";
import { createAuthProvidersTable } from "./createAuthProvidersTable.js";
import { createActivitiesTable } from "./createActivitiesTable.js";
import { createActivitySessionsTable } from "./createActivitySessionsTable.js";
import { createActivitySessionSegmentsTable } from "./createActivitySessionSegmentsTable.js";
import { createDayPlansTable } from "./createDayPlansTable.js";
import { createDayPlanItemsTable } from "./createDayPlanItemsTable.js";
import { createEmailVerificationsTable } from "./createEmailVerificationsTable.js";
import { createPasswordResetsTable } from "./createPasswordResetsTable.js";
import { createNotificationJobsTable } from "./createNotificationJobsTable.js";
import { createPushSubscriptionsTable } from "./createPushSubscriptionsTable.js";
import { createActivitySettingsTable } from "./createActivitySettingsTable.js";

export const createAllTables = async () => {
  await ensureDatabase();

  await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  await createUsersTable();
  await createAuthProvidersTable();
  await createActivitiesTable();
  await createActivitySessionsTable();
  await createActivitySessionSegmentsTable();
  await createDayPlansTable();
  await createDayPlanItemsTable();
  await createEmailVerificationsTable();
  await createPasswordResetsTable();
  await createNotificationJobsTable();
  await createPushSubscriptionsTable();
  await createActivitySettingsTable();
};

if (isMainModule(import.meta.url)) {
  createAllTables()
    .then(() => {
      console.log("✅ Все таблицы созданы");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Скрипт завершен с ошибкой:", error);
      process.exit(1);
    });
}

// npx tsx ./scripts/createAllTables.ts
