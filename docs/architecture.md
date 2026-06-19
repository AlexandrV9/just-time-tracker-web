# Time Tracker — Architecture

Документ состоит из двух частей:

- **Часть A** — фактическая системная архитектура (как устроено сейчас)
- **Часть B** — доменные правила и инварианты (целевая модель)

---

# Часть A. Системная архитектура

## A.1 Monorepo

```
time-tracker/
├── packages/
│   ├── client/    @time-tracker/client   — React SPA
│   ├── server/    @time-tracker/server   — Hono API
│   └── shared/    @time-tracker/shared   — Zod-схемы и DTO
├── .docker/       postgres + pgadmin для локальной разработки
├── docker-compose.yml          — полный локальный стек
├── docker-compose.prod.yml     — prod через GHCR-образы
└── .github/workflows/docker-publish.yml
```

- **Package manager:** pnpm 10.26 (`pnpm-workspace.yaml`)
- **Root scripts:** `pnpm dev` (client + server + shared), `pnpm verify` (lint → build:shared → test → build), `pnpm test` (только server)

## A.2 Стек


| Слой   | Технологии                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------- |
| Client | React 19, Vite 7, TypeScript, TanStack Router, TanStack Query, Zustand, Chakra UI v3, axios, i18next, Zod, vite-plugin-pwa |
| Server | Hono 4, `@hono/node-server`, TypeScript, `pg`, bcrypt                                                                      |
| DB     | PostgreSQL 15                                                                                                              |
| CI/CD  | GitHub Actions → GHCR (`ghcr.io/<owner>/time-tracker/{client,server}`)                                                     |


## A.3 Аутентификация

### Сервер

**Публичные маршруты** (`packages/server/src/index.ts`):

- `/auth/`* — вход, регистрация, восстановление сессии
- `/health` — healthcheck

**Защищённые маршруты** — всё остальное за `authMiddleware`:

- проверяет `Authorization: Bearer <accessToken>`
- кладёт в контекст `user: { id: string }`

**Токены** (`packages/server/src/shared/config/index.ts`):

- Access JWT — 3 минуты, в заголовке `Authorization`
- Refresh JWT — 7 дней, httpOnly cookie `refresh_token`

**Auth routes** (`packages/server/src/auth/auth.routes.ts`):


| Метод | Путь                  | Назначение                                                     |
| ----- | --------------------- | -------------------------------------------------------------- |
| GET   | `/auth`               | init: access token → user; иначе refresh cookie → новый access |
| POST  | `/auth/sign-in`       | вход                                                           |
| POST  | `/auth/sign-up`       | регистрация                                                    |
| POST  | `/auth/sign-out`      | выход                                                          |
| GET   | `/auth/check-refresh` | проверка наличия refresh cookie                                |


### Привязка данных к пользователю

Клиент **не передаёт** `createdById` в запросах. Сервер подставляет его из JWT через `withCreatedById()` (`packages/server/src/shared/auth/with-created-by-id.ts`) в handlers для create/list/query операций.

### Клиент

- Access token — `localStorage` (`tokenManager`)
- Refresh — httpOnly cookie (`withCredentials: true`)
- Axios interceptor (`packages/client/src/shared/config/axios.ts`): при 401 пробует обновить токен
- Приватные маршруты: `authManager.checkAuth()` в `beforeLoad` (`routes/(private)/_private.tsx`)

## A.4 Серверная архитектура

Паттерн на фичу (пример `packages/server/src/activity/`):

```
*.routes.ts  →  *.handlers.ts  →  *.service.ts  →  *.repository.ts + *.queries.ts
```

**Handlers** — `createValidatedHandler()` (`shared/utils/request.ts`):

1. parse request (query / body / params)
2. Zod-валидация через схемы из `@time-tracker/shared`
3. optional `withCreatedById(c, data)` — для user-scoped операций
4. вызов service → JSON-ответ

**Tracking** — транзакционная логика в `activitySession.tracking.service.ts`; SSE-публикация из `activity.service.ts`.

**SQL** — raw queries через `pg` pool (`shared/db/pool.ts`).

### API-маршруты (фактические)

Все за auth middleware, префикс `/`:


| Префикс                      | Назначение                                     |
| ---------------------------- | ---------------------------------------------- |
| `/activities`                | CRUD, lifecycle, analytics, grouped lists, SSE |
| `/activity-sessions`         | GET/DELETE по id                               |
| `/activity-session-segments` | GET по id                                      |
| `/day-plans`                 | планы на день                                  |
| `/day-plan-items`            | элементы плана (+ batch add)                   |


**Activities** (`packages/server/src/activity/activity.routes.ts`):

```
GET    /activities/events              SSE-поток событий трекинга
GET    /activities                     список (фильтр по текущему user)
POST   /activities                     создать activity
GET    /activities/current             текущие/активные за интервал
GET    /activities/tracked             завершённые за интервал
GET    /activities/grouped             история по группам (day/week/month)
GET    /activities/grouped/items       догрузка элементов группы
GET    /activities/analytics           batch analytics
POST   /activities/start               start / resume
POST   /activities/pause               pause
POST   /activities/finish              finish
GET    /activities/:id                 по id
PATCH  /activities/:id                 обновить title/description/tags
DELETE /activities/:id
GET    /activities/:id/sessions
GET    /activities/:id/session-segments
GET    /activities/:id/analytics
POST   /activities/by-ids
```

**Lifecycle body** (не path-param):

```ts
POST /activities/start   { activityId, startedAt, clientId? }
POST /activities/pause   { activityId, pausedAt, clientId? }
POST /activities/finish  { activityId, finishedAt, clientId? }
```

Отдельного `resume` endpoint нет — resume через `POST /activities/start` на paused session.

**Lifecycle response:**

```ts
{
  activity: ActivityDTO;
  session: ActivitySessionDTO;
  segment: ActivitySessionSegmentDTO | null;
}
```

## A.5 Клиентская архитектура

Структура (FSD-подобная):


| Слой     | Путь            | Содержимое                                      |
| -------- | --------------- | ----------------------------------------------- |
| app      | `src/app/`      | providers, глобальные стили                     |
| routes   | `src/routes/`   | TanStack file-based routing                     |
| features | `src/features/` | auth, activity hooks, i18n, theme               |
| widgets  | `src/widgets/`  | TodayActivityList, ActivityList, NavBar, Header |
| entities | `src/entities/` | карточки Activity                               |
| shared   | `src/shared/`   | api, ui, hooks, libs, config                    |


**Routing:** `@tanstack/router-plugin` → `routeTree.gen.ts`; router context несёт `queryClient`.

**State:**

- **TanStack Query** — серверные данные (activities, day plans, analytics)
- **Zustand** — auth, current activity, header

**API layer:** `shared/api/services/` → `baseApi` (axios) → `/api/...`

**Dev proxy** (`vite.config.ts`): `/api` → `VITE_API_ENDPOINT` (prefix `/api` снимается); для SSE `/activities/events` — специальные заголовки без буферизации.

**Real-time:** `useActivityEvents` в private layout подписывается на `GET /api/activities/events`, валидирует события shared-схемой, обновляет Zustand + invalidates React Query.

**Env:**

- `VITE_API_ENDPOINT` — target для Vite proxy и refresh URL
- `VITE_APP_URL` — axios `baseURL`

## A.6 Shared package

`packages/shared/src/` — единый источник Zod-схем и TypeScript DTO для client и server:

- `activity/` — activity, session, segment, events, analytics, grouped
- `dayPlan/`, `dayPlanItem/`
- `common/` — pagination, `baseIdSchema`

Сборка: `tsc` → `dist/`; импорт как `workspace:`*.

Request-схемы **не содержат** `createdById` — только response DTO (поле есть у сущностей).

## A.7 Деплой


| Файл                          | Назначение                                    |
| ----------------------------- | --------------------------------------------- |
| `.docker/docker-compose.yaml` | только postgres (+ pgadmin) для `pnpm dev`    |
| `docker-compose.yml`          | client + server + postgres (локальная сборка) |
| `docker-compose.prod.yml`     | pull образов из GHCR + postgres               |


CI: push в `main` → `pnpm verify` (с postgres service) → docker build/push client + server.

Подробности: [docs/docker.md](docs/docker.md).

## A.8 Тестирование

- **Scope:** только server (`pnpm test` → Vitest)
- **Integration:** HTTP-тесты router с mock auth middleware (`tests/setup/test-auth.ts`, `TEST_USER_ID = "user-1"`)
- **DB:** Testcontainers PostgreSQL или существующий postgres (`tests/setup/test-db.ts`)
- **Client tests:** нет

## A.9 Статус реализации


| Функция                                              | Статус                                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Activity tracking (start/pause/finish/resume)        | ✅ реализовано                                                                 |
| SSE sync между вкладками/устройствами                | ✅ реализовано                                                                 |
| Day plans                                            | ✅ реализовано                                                                 |
| Grouped history / analytics                          | ✅ реализовано                                                                 |
| User scoping через JWT (без `createdById` с клиента) | ✅ реализовано                                                                 |
| SyncManager / offline sync                           | ⏳ код закомментирован, не активен                                             |
| IndexedDB wrapper                                    | ⏳ есть (`shared/services/IndexedDB/`), используется только SyncManager        |
| CORS на сервере                                      | ⏳ закомментирован в `index.ts`                                                |


---

# Часть B. Domain Specification

Доменные правила. Любые изменения модели должны проверяться на соответствие этим правилам.

## B.1 Core Domain Model

### B.1.1 Activity

`Activity` — долгоживущая сущность, описывающая тип работы.

Примеры: Work, Reading, Coding.

**Важно:**

- Activity ≠ выполнение
- Activity может иметь много сессий (ActivitySession)

### B.1.2 ActivitySession

`ActivitySession` — один непрерывный эпизод работы над активностью.

Сессия:

- начинается при `start`
- заканчивается при `finish`
- состоит из непрерывных сегментов (ActivitySessionSegment); между сегментами нет «дыр»
- содержит сегменты двух типов: `active` / `pause`

### B.1.3 ActivitySessionSegment

`ActivitySessionSegment` — минимальная единица времени (источник истины).

Типы: `active`, `pause`.

## B.2 Source of Truth

### B.2.1 Иерархия истины

```
Segment → Session → Activity
```

- Segment — единственный источник истины
- Session — агрегат по сегментам
- Activity — агрегат по сессиям

### B.2.2 Денормализованные поля

Допустимые кэш-поля:

- `Activity.activeDurationMs`, `Activity.pauseDurationMs`
- `ActivitySession.activeDurationMs`, `ActivitySession.pauseDurationMs`

Они ускоряют чтение и могут быть пересчитаны из сегментов.

### B.2.3 Activity status

В **таблице** `activities` нет колонки `status`.

Статус **вычисляется** при чтении (SQL join с `activity_sessions` по `currentActivitySessionId`):

- `currentActivitySessionId = null` → `idle`
- session `active` → `active`
- session `paused` → `paused`

В **DTO** (`ActivityDTO`) поле `status` присутствует — это computed field для API/UI, не persisted state.

## B.3 Invariants

### B.3.1 Единственная активная сессия

У пользователя: максимум 1 незавершённая session.

### B.3.2 Связь Activity ↔ Session

Если `activity.currentActivitySessionId !== null`, то session существует и не в статусе `finished`.

### B.3.3 Status ↔ endedAt


| status   | endedAt  |
| -------- | -------- |
| active   | null     |
| paused   | null     |
| finished | NOT null |


### B.3.4 Открытые сегменты

У незавершённой session: ровно 1 segment с `endedAt = null`.

### B.3.5 Соответствие статусу


| session.status | open segment type |
| -------------- | ----------------- |
| active         | active            |
| paused         | pause             |
| finished       | none              |


### B.3.6 Последовательность сегментов

Сегменты внутри session:

- не пересекаются
- идут подряд
- чередуются: `active → pause → active → ...`

### B.3.7 Первый сегмент

Новая session всегда начинается с `active` segment.

## B.4 State Transitions

### B.4.1 Start (новая activity)

Создаёт: session (active) + первый active segment.

### B.4.2 Pause

- закрывает active segment
- обновляет activeDuration
- session → paused
- открывает pause segment

### B.4.3 Resume

- закрывает pause segment
- обновляет pauseDuration
- session → active
- открывает active segment

(Реализовано через `POST /activities/start`)

### B.4.4 Finish

- закрывает текущий segment
- session → finished, `session.endedAt = now`
- `activity.currentActivitySessionId = null`

### B.4.5 Switch Activity

Если есть незавершённая session — она автоматически завершается (finish), затем создаётся новая session для новой activity.

## B.5 Time & Analytics

### B.5.1 Сессии не делятся по дням

Нельзя завершать session в полночь искусственно.

### B.5.2 Аналитика строится по segment

Не по session.

### B.5.3 Пересечение полуночи

Segment `23:50 → 00:20`:

- день 1 → 10 мин
- день 2 → 20 мин

### B.5.4 Таймзона

- хранение: UTC
- аналитика: локальная TZ пользователя

### B.5.5 История — read-only

Исторические данные нельзя запускать/паузить — только просмотр.

## B.6 UI Rules

### B.6.1 Разделение зон

1. Текущий таймер
2. Активные карточки (today plan)
3. История

### B.6.2 Главный таймер

Текущая session + текущее время.

### B.6.3 Карточки

- Активные (выбраны на сегодня): start / pause / resume
- История: read-only

### B.6.4 Время

Главный счётчик = только active time.

## B.7 API Rules

### B.7.1 Отдельные действия

Не использовать `PATCH /activities/:id` для start/pause/finish — только dedicated endpoints.

### B.7.2 Lifecycle endpoints (фактические)

```
POST /activities/start
POST /activities/pause
POST /activities/finish
```

Body: `{ activityId, startedAt|pausedAt|finishedAt, clientId? }`.

### B.7.3 Единый ответ lifecycle

```ts
{
  activity: ActivityDTO;
  session: ActivitySessionDTO;
  segment: ActivitySessionSegmentDTO | null;
}
```

### B.7.4 Current / tracked activities

```
GET /activities/current?fromDate&toDate&status&page&limit
GET /activities/tracked?fromDate&toDate&page&limit
```

User scope — из JWT, `createdById` в query не передаётся.

### B.7.5 SSE events

```
GET /activities/events
```

События: `started` | `paused` | `finished` (+ `ping` keep-alive для поддержания SSE-соединения).

## B.8 Consistency

### B.8.1 Транзакционность

start, pause, resume, finish, switch — атомарны (DB transaction).

### B.8.2 Сервер — источник истины

Frontend не решает бизнес-логику, только отображает состояние.

### B.8.3 Предсказуемость

Любое действие детерминировано и одинаково при повторе.

## B.9 Anti-Patterns (Запрещено)

- ❌ Хранить `status` в таблице `activities`
- ❌ Иметь 2 незавершённые session у одного user
- ❌ Иметь session без открытого segment
- ❌ Делить session по дням
- ❌ Строить аналитику по session вместо segment
- ❌ Делать историю интерактивной
- ❌ Давать frontend управлять логикой состояний
- ❌ Передавать `createdById` / `userId` с клиента в API-запросах
- ❌ Автоматически завершать session без явного действия пользователя

## B.10 Core Principles (TL;DR)

1. Segment — источник истины
2. Session — один запуск
3. Activity — контейнер
4. Только одна активная session на user
5. Start другой activity → finish предыдущей
6. День — это аналитика, не домен
7. UI и Domain разделены
8. User identity — только из auth middleware
9. Session завершается только явным `finish` (или switch → finish предыдущей)

