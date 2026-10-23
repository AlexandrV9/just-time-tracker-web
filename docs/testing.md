# Тестирование

Сверено с конфигурацией версии **1.1.12**. Автоматические тесты есть у сервера (Vitest 3); отдельных client/shared тестов нет. Клиент проверяется ESLint, проверкой переводов и сборкой TypeScript/Vite.

## Быстрый старт

Из корня репозитория, при запущенном Docker daemon:

```bash
pnpm install --frozen-lockfile
pnpm build:shared
pnpm test
```

По умолчанию `.env.test` включает Testcontainers: отдельный PostgreSQL `postgres:16-alpine` создаётся на время тестов. Compose postgres для этого варианта не нужен.

Полная проверка:

```bash
pnpm verify
```

Порядок из корневого `package.json`:

1. `pnpm lint` — ESLint клиента, без предупреждений.
2. `pnpm i18n:check` — проверка ключей переводов скриптом клиента.
3. `pnpm build:shared` — сборка shared до импортирующих его тестов.
4. `pnpm test` — все тесты сервера.
5. `pnpm build` — параллельная сборка shared, client и server.

## Команды

```bash
pnpm test
pnpm --filter @time-tracker/server test:watch
pnpm --filter @time-tracker/server exec vitest run src
pnpm --filter @time-tracker/server exec vitest run tests/integration/activity.handlers.test.ts
pnpm --filter @time-tracker/server exec vitest run --reporter=verbose
```

Фильтр `src` сейчас запускает только `health.routes.test.ts`. Тест hub находится в `tests/integration/activityEvents.hub.test.ts`, хотя проверяет hub без настоящей БД.

## Выбор тестовой БД

`tests/setup/test-db.ts` выбирает подключение по приоритету:

1. `TEST_DATABASE_URL` — готовая **отдельная тестовая** БД.
2. `USE_TESTCONTAINERS=true` — временный PostgreSQL 16 в Docker.
3. `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` — существующий PostgreSQL; helper создаёт БД `TEST_DB_NAME` (по умолчанию `time_tracker_test`) через подключение к `postgres`.

В fallback-варианте пользователь должен иметь право создавать БД. Схему тесты создают своими helpers, а не прогоном production migrations. Файлы тестов выполняются последовательно (`fileParallelism: false`), чтобы не конфликтовать при очистке таблиц.

### Загрузка env и переопределения

Vitest загружает:

1. Корневой `.env` — без override уже заданных переменных процесса.
2. `packages/server/.env` — также без override.
3. Корневой `.env.test` — **с `override: true`**.

Поэтому `USE_TESTCONTAINERS=false pnpm test` **не отключит** Testcontainers: значение будет заменено из `.env.test`. Для fallback измените `USE_TESTCONTAINERS=false` в `.env.test` и задайте `DB_HOST=localhost`, остальные `DB_*` и `TEST_DB_NAME=time_tracker_test`.

```bash
# После изменения .env.test и настройки DB_*
docker compose --env-file .env -f .docker/docker-compose.yaml up -d postgres
pnpm test
```

Compose использует PostgreSQL **15**, а Testcontainers — **16**.

Альтернатива без изменения `USE_TESTCONTAINERS`: `TEST_DATABASE_URL` имеет более высокий приоритет:

```bash
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/time_tracker_test pnpm test
```

В этом варианте БД должна уже существовать. Используйте только выделенную тестовую БД: тесты очищают таблицы.

`DEV_DB_PROTECT` задаёт имена защищённых БД через запятую; `.env.test` устанавливает `time_tracker`. Helpers проверяют имя БД перед очисткой. При нестандартном имени dev-БД добавьте его в `DEV_DB_PROTECT` в `.env.test`; не полагайтесь на защиту только стандартного имени.

### CI

Workflow `.github/workflows/docker-publish.yml` объявляет service `postgres:15-alpine` с БД `time_tracker_test` и задаёт `DB_*`. Однако текущий `.env.test` принудительно включает Testcontainers, поэтому helpers выбирают PostgreSQL 16, а не этот service. Секреты токенов из `.env.test` также перекрывают значения CI. Чтобы использовать service, нужно изменить настройки загрузки env или задать `TEST_DATABASE_URL`.

## Что покрывают тесты

| Файлы в `packages/server` | Покрытие |
| --- | --- |
| `src/health/health.routes.test.ts` | health router |
| `tests/integration/activityEvents.hub.test.ts` | публикация событий, подписчики пользователя |
| `tests/integration/activity.test.ts` | repository CRUD |
| `tests/integration/activity.tracking.test.ts` | start/pause/resume/finish, сегменты и длительности |
| `tests/integration/activity.handlers.test.ts` | HTTP handlers, validation, списки, аналитика |
| `tests/integration/user.handlers.test.ts` | профиль пользователя |
| `tests/integration/passwordReset.service.test.ts` | восстановление пароля |
| `tests/integration/yandex.service.test.ts` | OAuth service; это не проверка включённых production routes |
| `tests/integration/notifications.test.ts` | jobs и worker |
| `tests/integration/activityNotification.scheduler.test.ts` | планирование напоминаний |
| `tests/integration/pushNotificationSender.test.ts` | push sender с mock зависимостями |
| `tests/integration/pushSubscriptions.handlers.test.ts` | HTTP API подписок |

HTTP-тесты защищённых routers используют mock auth (`tests/setup/test-auth.ts`, `TEST_USER_ID = "user-1"`), а не настоящий JWT. Эти тесты не доказывают полную изоляцию ресурсов между пользователями. Успешный тест OAuth service также не означает доступность OAuth endpoints — сейчас они закомментированы.

## Ручная проверка

Для запуска через `pnpm dev` нужны PostgreSQL со схемой, серверный `DB_HOST=localhost` и `packages/client/.env` с `VITE_APP_URL=http://localhost:3000`, `VITE_API_ENDPOINT=http://localhost:9000`. Vite не читает корневой `.env` автоматически. Подробности: [docker.md](docker.md).

1. Открыть `http://localhost:3000`: регистрация, вход, refresh после трёх минут.
2. Создать activity, start → pause → resume → finish; проверить таймер и план на сегодня.
3. Проверить историю, переход с датой в аналитику и возврат с выделением карточки, удаление завершённой сессии.
4. Открыть вторую вкладку: синхронизация через SSE; скрыть/вернуть вкладку и проверить восстановление состояния.
5. Проверить профиль, смену email и reset password. При `EMAIL_TRANSPORT=console` коды смотреть в логах сервера; для реального письма нужен SMTP.
6. Собрать production/PWA с VAPID, разрешить push, включить напоминания активности; проверить уведомления при открытом и закрытом приложении. В Vite dev service worker отключён.
7. `/calendar` должен показывать заглушку; Yandex OAuth сейчас не входит в успешный smoke-сценарий.

```bash
curl http://localhost:9000/health
# В Docker через client nginx:
curl http://localhost:3000/api/health
```

## Troubleshooting

- `Cannot find module '@time-tracker/shared'`: выполните `pnpm build:shared`.
- Ошибка Docker/Testcontainers: запустите Docker daemon либо настройте выделенную БД через `TEST_DATABASE_URL`.
- Нужен fallback `DB_*`: измените `.env.test`, одного shell-переопределения `USE_TESTCONTAINERS=false` недостаточно.
- Проверка CI остановилась на переводах: `pnpm i18n:check`.
- Ошибка сборки клиента: `pnpm --filter @time-tracker/client build`.

Новые тесты размещайте в `src/**/*.test.ts` или `tests/**/*.test.ts`; для БД используйте существующие helpers и защиту перед очисткой. Перед merge запускайте `pnpm verify`.
