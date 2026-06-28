# Тестирование

Краткое руководство: как запускать тесты локально и что проверяется в CI.

## Обзор

| Область                     | Инструмент          | Где                                    |
| --------------------------- | ------------------- | -------------------------------------- |
| Server (unit + integration) | Vitest 3            | `packages/server`                      |
| Client                      | —                   | тестов нет                             |
| Shared                      | через server/client | отдельных тестов нет                   |
| CI                          | `pnpm verify`       | `.github/workflows/docker-publish.yml` |

## Быстрый старт

```bash
# 1. PostgreSQL для интеграционных тестов
docker compose -f .docker/docker-compose.yaml up -d postgres

# 2. Переменные (можно скопировать из .env.example)
cp .env.example .env

# 3. Сборка shared (нужна до test/build)
pnpm build:shared

# 4. Все тесты сервера
pnpm test
```

Полная проверка перед merge (как в CI):

```bash
pnpm verify   # lint + build:shared + test + build
```

## Команды

Из корня репозитория:

```bash
pnpm test                                          # все тесты server
pnpm --filter @time-tracker/server test:watch        # watch-режим
pnpm --filter @time-tracker/server vitest run src      # только unit (без integration)
pnpm --filter @time-tracker/server vitest run tests/integration/activity.handlers.test.ts
```

Из `packages/server`:

```bash
pnpm test
pnpm test:watch
pnpm exec vitest run --reporter=verbose
```

## PostgreSQL для тестов

Интеграционные тесты требуют Postgres. Подключение выбирается в таком порядке (`tests/setup/test-db.ts`):

1. `**TEST_DATABASE_URL**` — полный connection string (приоритет)
2. `**USE_TESTCONTAINERS=true**` — ephemeral Postgres в Docker (**default** через `.env.test`)
3. **Переменные `DB_*`** — fallback: отдельная БД `TEST_DB_NAME` на локальном Postgres

**Dev-БД (`time_tracker`) не трогается:** `DEV_DB_PROTECT` + guard перед каждым `TRUNCATE`.  
Vitest загружает `.env.test` последним → `USE_TESTCONTAINERS=true`.

### Вариант A: Testcontainers (рекомендуется, default)

Нужен **Docker daemon**. Отдельный ephemeral Postgres на время `pnpm test`:

```bash
pnpm test
```

В логе: `[tests] Using database "time_tracker_test" (Testcontainers)`.

Явно:

```bash
USE_TESTCONTAINERS=true pnpm test
```

### Вариант B: Docker Compose postgres + отдельная time_tracker_test

Если Testcontainers недоступен:

```bash
USE_TESTCONTAINERS=false pnpm test
```

```bash
docker compose -f .docker/docker-compose.yaml up -d postgres
```

Тесты используют `TEST_DB_NAME=time_tracker_test` (не `time_tracker`).

Поднимается `postgres:16-alpine`, схема создаётся в `beforeAll`.

### Вариант C: CI (GitHub Actions)

Job `verify` в workflow поднимает service container `postgres:15-alpine` и задаёт env:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=time_tracker_test
DB_USER=postgres
DB_PASSWORD=postgres
ACCESS_TOKEN_SECRET=ci-access-token-secret
REFRESH_TOKEN_SECRET=ci-refresh-token-secret
```

## Структура тестов

```
packages/server/
├── vitest.config.ts
├── tests/
│   ├── setup/
│   │   ├── vitest.setup.ts      # загрузка .env
│   │   ├── test-db.ts           # Postgres + DDL для тестов
│   │   └── test-auth.ts         # mock auth (TEST_USER_ID = "user-1")
│   └── integration/
│       ├── activity.handlers.test.ts   # HTTP router (17 tests)
│       ├── activity.tracking.test.ts   # start/pause/finish service
│       └── activity.test.ts            # repository CRUD
└── src/
    ├── activity/activityEvents.hub.test.ts
    └── health/health.routes.test.ts
```

### Типы тестов

| Файл                         | Уровень     | БД  | Auth mock                    |
| ---------------------------- | ----------- | --- | ---------------------------- |
| `activityEvents.hub.test.ts` | unit        | нет | нет                          |
| `health.routes.test.ts`      | unit        | нет | нет                          |
| `activity.test.ts`           | integration | да  | нет (repository)             |
| `activity.tracking.test.ts`  | integration | да  | нет (service)                |
| `activity.handlers.test.ts`  | integration | да  | да (`testRouter` + JWT user) |

### Auth в integration-тестах

HTTP-тесты не используют реальный JWT. Router оборачивается middleware, который ставит `user.id = "user-1"`:

```ts
testRouter.use("*", async (c, next) => {
  c.set("user", { id: TEST_USER_ID });
  await next();
});
testRouter.route("/", activitiesRouter);
```

`createdById` в query/body **не передаётся** — как в production, подставляется на сервере.

## Переменные окружения

| Variable               | Назначение                         |
| ---------------------- | ---------------------------------- |
| `DB_HOST`              | хост Postgres                      |
| `DB_PORT`              | порт (5432)                        |
| `DB_USER`              | пользователь                       |
| `DB_PASSWORD`          | пароль                             |
| `DB_NAME`              | основная БД приложения             |
| `TEST_DB_NAME`         | БД для fallback-тестов (default: `time_tracker_test`) |
| `DEV_DB_PROTECT`       | dev-БД, которую тесты **никогда** не TRUNCATE (default: `time_tracker`) |
| `TEST_DATABASE_URL`    | альтернатива `DB_*` (полный URL)   |
| `USE_TESTCONTAINERS`   | `true` → Docker Testcontainers (**default** в `.env.test`) |
| `ACCESS_TOKEN_SECRET`  | нужен при импорте server config    |
| `REFRESH_TOKEN_SECRET` | нужен при импорте server config    |

Vitest setup загружает env из:

1. `<repo>/.env`
2. `packages/server/.env`
3. `<repo>/.env.test` — override: `USE_TESTCONTAINERS=true`, `DEV_DB_PROTECT=time_tracker`

## Что проверяет `pnpm verify`

Последовательность (как в CI):

1. `**pnpm lint`\*\* — ESLint клиента (`packages/client`)
2. `**pnpm build:shared**` — сборка `@time-tracker/shared` (нужна для импортов в тестах)
3. `**pnpm test**` — Vitest server
4. `**pnpm build**` — сборка shared + client + server

## Ручное тестирование (smoke)

### API

```bash
# health
curl http://localhost:9000/health

# sign-up / sign-in → получить access token
# далее запросы с Authorization: Bearer <token>
```

### Client

1. `pnpm dev` + postgres
2. [http://localhost:3000](http://localhost:3000) — регистрация, вход
3. Создание activity, start/pause/finish
4. Today plan, history
5. SSE: открыть вторую вкладку — синхронизация таймера

### Docker-образы

```bash
docker build -f packages/server/Dockerfile -t time-tracker-server .
docker build -f packages/client/Dockerfile \
  --build-arg VITE_API_ENDPOINT=http://localhost:9000 \
  --build-arg VITE_APP_URL=http://localhost:9000 \
  -t time-tracker-client .
```

## Troubleshooting

### `Cannot find module '@time-tracker/shared'`

```bash
pnpm build:shared
```

### Integration tests skipped / failed on DB

- Проверь, что Postgres запущен: `docker compose -f .docker/docker-compose.yaml ps`
- Проверь `DB_*` в `.env`
- Или: `USE_TESTCONTAINERS=true pnpm test`

### Testcontainers timeout

Docker daemon должен быть запущен. При проблемах с сетью используй вариант A (docker compose postgres).

### CI падает на `build:client`

Частая причина — TypeScript ошибки в client. Локально: `pnpm --filter @time-tracker/client build`.

## Добавление новых тестов

1. Unit — рядом с кодом: `src/**/*.test.ts`
2. Integration — `tests/integration/*.test.ts`
3. Если нужен Postgres — `beforeAll(() => startTestDatabase())`, `afterAll(() => testDb.stop())`
4. HTTP-тесты protected routes — оборачивай router mock auth (см. `activity.handlers.test.ts`)
5. Перед commit: `pnpm verify`
