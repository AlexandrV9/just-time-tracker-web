# Обновление деплоя

Как подтянуть новую версию после merge в `main`.

Первичный деплой с нуля: [deploy.md](deploy.md).

---

## Деплой 1.1.14 (согласие на регистрацию)

Краткий чеклист для обновления **существующего** prod с 1.1.13.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).

Миграция БД **не нужна**. Новых переменных в `.env` нет.

### 2. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### 3. Smoke-тест после 1.1.14

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | `/signup` → Submit без чекбоксов | Регистрация не уходит, оба чекбокса красные |
| 3 | Отметить оба чекбокса → Submit с валидными полями | Регистрация проходит |
| 4 | Ссылки «Пользовательское соглашение» / «Политика» | Открывают `/terms-of-service` и `/privacy-policy` |

Runtime-кэши SW версионируются через `VITE_APP_VERSION` (`1.1.14`).

---

## Деплой 1.1.13 (PWA install + rate limit)

Краткий чеклист для обновления **существующего** prod с 1.1.12.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).

Новые переменные в `.env` **не обязательны** — rate limit работает с дефолтами. При необходимости можно задать:

```env
RATE_LIMIT_LOGIN_MAX_PER_MINUTE_IP=5
RATE_LIMIT_LOGIN_MAX_FAILURES=5
RATE_LIMIT_RESET_MAX_PER_HOUR_EMAIL=3
RATE_LIMIT_EMAIL_VERIFY_MAX_PER_HOUR=3
```

### 2. Миграция БД (обязательно)

На **существующей** базе один раз:

**С локальной машины:**

```bash
scp packages/server/db/migrations/005_auth_rate_limits.sql \
  <USER>@<SERVER>:~/005_auth_rate_limits.sql
```

**На сервере:**

```bash
docker exec -i time-tracker-postgres psql -U postgres -d time_tracker \
  < ~/005_auth_rate_limits.sql

rm ~/005_auth_rate_limits.sql
```

Миграция идемпотентна (`CREATE TABLE IF NOT EXISTS`).

### 3. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### 4. Smoke-тест после 1.1.13

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | Выйти → войти в браузере (не PWA) | Модалка с предложением установить приложение |
| 3 | Настройки → Справочная информация → Установка приложения | Страница `/settings/pwa-install`, accordion по платформам |
| 4 | Модалка → «Показать инструкцию» | Переход на `/settings/pwa-install` |
| 5 | Модалка → «Больше не показывать» + Ок → повторный вход | Модалка не появляется |
| 6 | Вход: 5+ неверных паролей подряд | `RATE_LIMITED`, таймер до повтора |
| 7 | Восстановление пароля: 4+ запроса кода на один email за час | `RATE_LIMITED` с таймером |

Runtime-кэши SW версионируются через `VITE_APP_VERSION` (`1.1.13`).

---

## Деплой 1.1.12 (TimePicker layout, CI/Docker)

Краткий чеклист для обновления **существующего** prod с 1.1.11.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).

Миграция БД **не нужна**. Новых переменных в `.env` нет.

### 2. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### 3. Smoke-тест после 1.1.12

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | Активность → Настройки → поле длительности (iPhone) | 3 колонки, барабан скроллится, Confirm/Cancel |
| 3 | Календарь / date picker с временем | Time picker без overflow |

Runtime-кэши SW версионируются через `VITE_APP_VERSION` (`1.1.12`).

---

## Деплой 1.1.11 (PWA startup, тема, duration picker)

Краткий чеклист для обновления **существующего** prod с 1.1.10.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).

Миграция БД **не нужна**. Новых переменных в `.env` нет.

### 2. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### 3. Smoke-тест после 1.1.11

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | Открыть PWA с Home Screen (холодный старт) | Splash, без долгого белого экрана |
| 3 | Настройки → тема «Системная» → сменить тему ОС → перезагрузить | Тема совпадает с ОС |
| 4 | Активность → Настройки → поле длительности (iPhone) | Drum-пикер, секунды, Confirm/Cancel |
| 5 | Активность / Профиль → MainInfo | Заголовки и подписи переведены (не raw keys) |

Runtime-кэши SW версионируются через `VITE_APP_VERSION` (`1.1.11`).

---

## Деплой 1.1.10 (фикс push на iOS PWA)

Краткий чеклист для обновления **существующего** prod с 1.1.9.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).

Миграция БД **не нужна**. Новых переменных в `.env` нет (VAPID из 1.1.9 должен остаться).

### 2. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### 3. Smoke-тест после 1.1.10

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | PWA с Home Screen → открыть → `/settings/notifications` push **on** | Подписка в `push_subscriptions` |
| 3 | Свернуть PWA → дождаться reminder | Push на lock screen |
| 4 | Закрыть PWA из app switcher → дождаться reminder | Push через SW |

Runtime-кэши SW версионируются через `VITE_APP_VERSION` (`1.1.10`).

---

## Деплой 1.1.9 (Web Push)

Краткий чеклист для обновления **существующего** prod с 1.1.8.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).
3. Сгенерировать VAPID-ключи (один раз):

   ```bash
   npx web-push generate-vapid-keys
   ```

4. В **Settings → Actions → Variables** добавить/обновить:
   - `VITE_APP_URL=https://<ваш-домен>`
   - `VITE_API_ENDPOINT=https://<ваш-домен>`
   - `VITE_VAPID_PUBLIC_KEY=<public key из шага 3>`

### 2. Обновить `.env` на VPS

```env
VAPID_PUBLIC_KEY=<тот же public key>
VAPID_PRIVATE_KEY=<private key из шага 3>
VAPID_SUBJECT=mailto:noreply@yourdomain.com
```

Без `VAPID_*` push отключён (SSE/in-app reminders работают как раньше).

### 3. Миграция БД (обязательно)

На **существующей** базе один раз:

**С локальной машины:**

```bash
scp packages/server/db/migrations/004_users_locale_and_push.sql \
  <USER>@<SERVER>:~/004_users_locale_and_push.sql
```

**На сервере:**

```bash
docker exec -i time-tracker-postgres psql -U postgres -d time_tracker \
  < ~/004_users_locale_and_push.sql

rm ~/004_users_locale_and_push.sql
```

Миграция идемпотентна (`IF NOT EXISTS`).

### 4. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### 5. Smoke-тест после 1.1.9

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | `/settings/notifications` → включить push | Запрос permission; подписка в БД |
| 3 | Закрыть вкладку → дождаться reminder | Push от SW (не дублируется с открытой вкладкой) |
| 4 | Сменить язык в LangSwitcher | `users.locale` обновлён; push-тексты на новом языке |

Runtime-кэши SW версионируются через `VITE_APP_VERSION` (`1.1.9`).

---

## Деплой 1.1.8 (фикс goal-уведомлений)

Краткий чеклист для обновления **существующего** prod с 1.1.7.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).

Миграция БД **не нужна**. Новых переменных в `.env` нет.

### 2. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
curl -s http://localhost/api/health | jq .
```

### 3. Smoke-тест после 1.1.8

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | Достичь цели за день → продолжить работу / pause / resume | Goal-уведомление **не** приходит повторно |
| 3 | После достижения цели — долгая пауза или активность | Long pause / long activity **по-прежнему** приходят |

### 4. Кэш client

Runtime-кэши SW версионируются через `VITE_APP_VERSION` (`1.1.8`). После деплоя — обычное обновление страницы.

---

## Деплой 1.1.7 (уведомления + настройки активности)

Краткий чеклист для обновления **существующего** prod с 1.0.7.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).
3. В **Settings → Actions → Variables** убедиться, что заданы:
   - `VITE_APP_URL=https://<ваш-домен>`
   - `VITE_API_ENDPOINT=https://<ваш-домен>`

Новых обязательных переменных в `.env` на VPS нет. Web Push (`VITE_VAPID_PUBLIC_KEY`) — опционально, для будущего.

### 2. Миграция БД (обязательно)

На **существующей** базе (не на свежем postgres с пустым volume) один раз:

**С локальной машины** — скопировать файл:

```bash
scp packages/server/db/migrations/003_notifications_and_activity_settings.sql \
  <USER>@<SERVER>:~/003_notifications_and_activity_settings.sql
```

**На сервере** — выполнить:

```bash
docker exec -i time-tracker-postgres psql -U postgres -d time_tracker \
  < ~/003_notifications_and_activity_settings.sql

rm ~/003_notifications_and_activity_settings.sql
```

Если контейнер postgres называется иначе — подставьте имя из `docker ps`.

Миграция идемпотентна (`IF NOT EXISTS`) — повторный запуск безопасен.

> Если вы уже накатывали черновые `003_notification_jobs_*` или `004_activity_settings.sql` из dev-ветки — не страшно, эта `003` содержит тот же финальный schema.

### 3. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
curl -s http://localhost/api/health | jq .
```

### 4. Smoke-тест после 1.1.7

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | Hard refresh / переустановка PWA | Новая версия client, свежие locales |
| 3 | Активность → Настройки | Цель сессии и блок уведомлений сохраняются |
| 4 | Запустить таймер, включить «долгая активность» с коротким порогом | In-app напоминание (SSE toast) |
| 5 | Скролл на `/activities` → переход в Историю | Скролл сброшен вверх |
| 6 | Активность → Аналитика | Страница открывается без ошибок |

Логи worker уведомлений:

```bash
docker compose -f docker-compose.prod.yml logs -f server | grep -i notification
```

### 5. Кэш client после деплоя

В **1.1.7** runtime-кэши Service Worker (`locales`, `icons`, fonts) привязаны к версии приложения. После `pull client` пользователям достаточно обычного обновления страницы; SW подтянет новый precache автоматически (`autoUpdate`).

Если видите старые переводы — DevTools → Application → Service Workers → Unregister, затем hard refresh.

---

## Деплой 1.0.6 (Yandex OAuth + email)

Краткий чеклист для обновления **существующего** prod с 1.0.5.

### 1. GitHub — до деплоя

1. Смержить ветку в `main`.
2. Дождаться зелёного CI (сборка `client` + `server` в GHCR).
3. В **Settings → Actions → Variables** убедиться, что заданы:
   - `VITE_APP_URL=https://<ваш-домен>`
   - `VITE_API_ENDPOINT=https://<ваш-домен>`

### 2. Yandex OAuth (oauth.yandex.ru)

Создать приложение или обновить существующее:

| Поле | Значение |
|------|----------|
| Redirect URI | `https://<ваш-домен>/api/auth/yandex/callback` |
| Права | login:email, login:info |

Сохранить **Client ID** и **Client Secret** — понадобятся в `.env`.

### 3. SMTP (письма с кодами)

Без SMTP коды не уйдут на почту (в prod `EMAIL_TRANSPORT` должен быть `smtp`).

Пример для Yandex:

```env
EMAIL_TRANSPORT=smtp
EMAIL_FROM=Имя <noreply@yourdomain.com>
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=<пароль-приложения>
EMAIL_DAILY_LIMIT_PER_USER=4
```

Опционально:

```env
EMAIL_CODE_TTL_SEC=600
EMAIL_CODE_MAX_ATTEMPTS=5
EMAIL_CODE_RESEND_COOLDOWN_SEC=60
```

### 4. Обновить `.env` на VPS

SSH на сервер:

```bash
cd /opt/time-tracker
nano .env
```

**Добавить / обновить** (остальное не трогать):

```env
CLIENT_URL=https://<ваш-домен>

YANDEX_CLIENT_ID=<из oauth.yandex.ru>
YANDEX_CLIENT_SECRET=<из oauth.yandex.ru>
YANDEX_REDIRECT_URI=https://<ваш-домен>/api/auth/yandex/callback

EMAIL_TRANSPORT=smtp
EMAIL_FROM=...
SMTP_HOST=...
SMTP_PORT=465
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_DAILY_LIMIT_PER_USER=4
```

`ALLOWED_ORIGINS` должен содержать ваш prod-домен (уже должен быть с 1.0.5).

### 5. Миграция БД (обязательно)

На **существующей** базе (не на свежем postgres с пустым volume) один раз:

**С локальной машины** — скопировать файл:

```bash
scp packages/server/db/migrations/002_email_auth_verification.sql \
  <USER>@<SERVER>:~/002_email_auth_verification.sql
```

**На сервере** — выполнить:

```bash
docker exec -i time-tracker-postgres psql -U postgres -d time_tracker \
  < ~/002_email_auth_verification.sql

rm ~/002_email_auth_verification.sql
```

Если контейнер postgres называется иначе — подставьте имя из `docker ps`.

Миграция идемпотентна (`IF NOT EXISTS`) — повторный запуск безопасен.

> Если вы уже накатывали старый `003_user_email_daily_sends.sql` — не страшно, `002` содержит ту же таблицу.

### 6. Подтянуть образы и перезапустить

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
curl -s http://localhost/api/health | jq .
```

### 7. Smoke-тест после 1.0.6

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://<домен>/api/health` | `status: OK` |
| 2 | Вход через Yandex | Редирект обратно, пользователь в приложении |
| 3 | Настройки → Безопасность → Yandex | Привязка / отвязка |
| 4 | Настройки → смена email | Письмо с кодом, подтверждение |
| 5 | Sign out → «Забыли пароль?» | Код на почту, новый пароль |
| 6 | OAuth-аккаунт без пароля → задать пароль | Пароль сохраняется |

Логи при проблемах с почтой:

```bash
docker compose -f docker-compose.prod.yml logs -f server | grep -i email
```

---

## Когда обновлять (любая версия)

После push в `main` GitHub Actions публикует образы:

- `ghcr.io/alexandrv9/time-tracker/client:latest`
- `ghcr.io/alexandrv9/time-tracker/server:latest`

Дождитесь зелёного CI, затем обновите стек на VPS.

---

## Обновить всё

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Проверка:

```bash
docker compose -f docker-compose.prod.yml ps
curl http://localhost/api/health
```

---

## Обновить только client

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull client
docker compose -f docker-compose.prod.yml --env-file .env up -d client
```

---

## Обновить только server

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull server
docker compose -f docker-compose.prod.yml --env-file .env up -d server
```

---

## Важно про client-образ

`VITE_APP_URL` и `VITE_API_ENDPOINT` зашиваются в client **при сборке в CI**.

Если меняли Variables в GitHub — нужен новый push в `main` и `pull client` на VPS.

---

## Конкретная версия (по SHA)

В `.env`:

```env
IMAGE_TAG=<commit-sha>
```

```bash
cd /opt/time-tracker
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Вернуться на `latest`: `IMAGE_TAG=latest`.

---

## Миграции на существующей БД

`init.sql` выполняется **только при первом** создании volume postgres.  
При обновлении версии миграции накатываются вручную.

| Версия | Файл | Когда нужен |
|--------|------|-------------|
| 1.0.1 | `001_add_users_email_avatar.sql` | email + avatar в users |
| 1.0.6 | `002_email_auth_verification.sql` | OAuth, verification, password reset, лимит писем |
| 1.1.7 | `003_notifications_and_activity_settings.sql` | notification jobs, push subscriptions, activity settings |
| 1.1.9 | `004_users_locale_and_push.sql` | user locale, push_notifications_enabled |
| 1.1.13 | `005_auth_rate_limits.sql` | rate limiting login / reset / email verification |

**Через Docker:**

```bash
docker exec -i <CONTAINER_NAME> psql -U <DB_USER> -d <DB_NAME> \
  < ~/migration.sql
```

**Напрямую:**

```bash
PGPASSWORD=<DB_PASSWORD> psql -h localhost -U <DB_USER> -d <DB_NAME> \
  -f ~/migration.sql
```

---

## Если что-то пошло не так

```bash
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f client
```

Откат — через `IMAGE_TAG` на предыдущий SHA.

Полный troubleshooting: [deploy.md](deploy.md#troubleshooting).
