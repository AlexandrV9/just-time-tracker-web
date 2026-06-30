# Changelog

## 1.1.12

### Исправления

- **IOSTimePicker / DurationField на iPhone**: `min-width: 0` в 3-колоночной сетке (часы/минуты/секунды), скрытие пустого label — колонки не ломают layout

### CI / DevOps

- **i18n:check в CI**: `tsx` добавлен в devDependencies клиента
- **Docker build**: setup-buildx, pre-pull base images с retry, убран `# syntax=docker/dockerfile:1` (меньше таймаутов Docker Hub)

### DevOps

- Версия приложения: **1.1.12**
- Миграций БД нет (обновление с 1.1.11 — только `pull` + `up -d`)

---

## 1.1.11

### Исправления

- **PWA / белый экран при запуске**: inline splash в `index.html`, precached `index.html` в service worker, reload при `vite:preloadError`, синхронный `useDeviceDetect` (без flash `unknown`)
- **Системная тема**: при выборе «Системная» после перезагрузки приложение следует light/dark ОС (macOS/iOS)
- **DurationField на touch-устройствах**: drum-пикер с секундами и модалка Confirm/Cancel вместо native `input[type=time]` (на iOS секунды недоступны)
- **i18n**: недостающие ключи в MainInfo (активность, профиль)

### Dev

- Скрипт `i18n:check` в `verify` и pre-commit
- nginx: `no-cache` для `index.html` (входит в образ `client`)

### DevOps

- Версия приложения: **1.1.11**
- Миграций БД нет (обновление с 1.1.10 — только `pull` + `up -d`)

---

## 1.1.10

### Исправления

- **Web Push на iOS PWA в фоне**: push больше не пропускается, если SSE ещё «живой» на сервере, а клиент уже заморожен
- **SSE при сворачивании**: соединение рвётся при `visibilityState === 'hidden'`, переподключается при возврате в приложение
- Push при полностью закрытом PWA (Home Screen) работает через service worker, без SSE

### DevOps

- Версия приложения: **1.1.10**
- Миграций БД нет (обновление с 1.1.9 — только `pull` + `up -d`)

---

## 1.1.9

### Уведомления

- **Web Push** для activity reminders: VAPID, `PushNotificationSender`, API подписок
- Дедупликация: push не шлётся, если у пользователя активное SSE-соединение
- Локализация push на сервере (`getReminderCopy`) по `users.locale`
- Авто-подписка после входа; переключатель в `/settings/notifications`
- `LangSwitcher` синхронизирует locale в БД; locale из профиля применяется при auth

### Backend

- Миграция `004_users_locale_and_push.sql`: `users.locale`, `users.push_notifications_enabled`
- `PUT/DELETE /push-subscriptions`, `PATCH /users/me/locale`, `PATCH /users/me/push-notifications`
- Auth user: `locale`, `pushNotificationsEnabled`

### DevOps

- Версия приложения: **1.1.9**
- `.env`: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `VITE_VAPID_PUBLIC_KEY`
- GitHub Actions Variable: `VITE_VAPID_PUBLIC_KEY` (тот же public key, что на сервере)

---

## 1.1.8

### Исправления

- **Goal-уведомление**: после достижения цели за день повторно не планируется (resume/pause больше не триггерят дубли)
- Long pause и long activity после достижения цели работают как прежде
- Расчёт goal по активному времени за сегодня (UTC), а не по `session.activeDurationMs`

### DevOps

- Версия приложения: **1.1.8**
- Миграций БД нет (обновление с 1.1.7 — только `pull` + `up -d`)

---

## 1.1.7

### Активности

- Страница активности разбита на подмаршруты: **таймер**, **аналитика**, **настройки**
- **Настройки активности**: цель сессии (мотивация), уведомления (долгая пауза, долгая активность, достижение цели)
- Формы настроек на react-hook-form с автосохранением и скелетонами при загрузке
- In-app напоминания через SSE (`useActivityReminders`) с локализованным title/body
- Кнопка «Назад» с детальной страницы ведёт на `/activities`, а не в history браузера
- Сброс скролла при переходе между страницами

### UI

- Общие компоненты `NavList`, `SettingsCard`, `DurationField`
- NavBar: типы вынесены в constants, обновлён `Item`

### Backend

- Модуль **notifications**: планировщик, worker (таймер + fallback poll ≤5 с), SSE/console/composite senders
- Планирование long pause / long activity по **текущему сегменту** (не суммарному времени сессии)
- API `GET/PATCH /activities/:id/settings`
- Таблицы `notification_jobs`, `push_subscriptions`, `activity_settings`
- `notify_on_goal_reached` по умолчанию `false`

### PWA

- Runtime-кэши SW (`locales`, `icons`, fonts) версионируются через `VITE_APP_VERSION` — сброс после деплоя

### DevOps

- Миграция **`003_notifications_and_activity_settings.sql`** (jobs + push + activity settings)
- Версия приложения: **1.1.7**

---

## 1.0.7

### UI

- Модальные окна открываются по центру экрана (дефолт `placement="center"` в `Dialog`)
- NavBar: нижняя навигация снова растягивается на всю ширину (исправлен grid после refactor)
- Главный таймер: placeholder «Select activity» вместо «Select activity or start timer» (en / ru / zh)

### PWA и Service Worker

- SW переписан на **Workbox**: корректный precache с revision, автоочистка старых кэшей
- API и SSE (`/activities/events`) — только сеть, без кэширования
- Офлайн-навигация: fallback на precached `index.html`
- Кэш `/locales/` и `/icons/` (StaleWhileRevalidate), Google Fonts (CacheFirst)
- Подготовка к **Web Push**: обработчики `push` и `notificationclick` в SW
- Клиентский scaffold `pushNotifications/` (`subscribeToPush`, `unsubscribeFromPush`)
- Precache расширен: locales, icons, json (47 entries)
- nginx: `no-cache` для `/sw.js` и `/registerSW.js`

### DevOps

- `VITE_VAPID_PUBLIC_KEY` в `.env.example` (для будущего push API)
- workbox-пакеты в devDependencies клиента

---

## 1.0.6

### Авторизация

- **Yandex OAuth**: вход и регистрация через Яндекс, привязка/отвязка провайдера в настройках → Безопасность
- Аккаунт без пароля (только OAuth): можно задать пароль в настройках
- Страница **Восстановление доступа** (`/recover-account`): сброс пароля по коду из письма

### Email

- **Подтверждение email** при смене почты в профиле и на шаге регистрации (`/signup-email`)
- Письма с кодом: SMTP (prod) или console (dev), шаблон с логотипом, локализация en / ru / zh (`Accept-Language`)
- **Дневной лимит писем** на пользователя (`EMAIL_DAILY_LIMIT_PER_USER`, по умолчанию 4) — verification + password reset

### Настройки

- Профиль и безопасность разделены: имя / email / пароль / способы входа
- Смена пароля (текущий + новый) и первичная установка пароля для OAuth-аккаунтов

### UX

- Восстановление шага «код» после refresh (recover-account): статус с сервера, таймер resend продолжает идти
- «Назад» на email без повторной отправки письма, пока сессия активна
- Отмена смены email на первом шаге модалки — сброс pending на сервере и чистая форма

### Backend

- Модули: `emailVerification/`, password reset, Yandex OAuth, email daily limit
- API: `/email-verification/*`, `/auth/password-reset/*`, `/auth/yandex/*`, `/users/me/password`
- Миграция **`002_email_auth_verification.sql`**: OAuth-провайдеры, email verification, password resets, счётчик писем

### DevOps

- Новые переменные в `.env.example`: Yandex OAuth, SMTP, `CLIENT_URL`, email limits

---

## 1.0.5

### UI

- `AuthUserInfo`: безопасный fallback для имени (`Unknown`), аватар с `variant="subtle"`

### DevOps

- GitHub Actions: job `deploy` — автодеплой на VPS после публикации Docker-образов (`docker compose pull` + `up -d`)
- `docker-compose.prod.yml`: `pull_policy: always` для `client` и `server`

---

## 1.0.4

### Исправления

- Выпадающие меню языка/темы больше не перекрываются хедером/контентом: `Select.Positioner` получает `--z-index` (Chakra v3)
- Backdrop модалок накрывает хедер: слои z-index вынесены в `shared/constants/zIndex` (header `10`, modal `20`), `Dialog.Backdrop` и `Dialog.Positioner` получают `zIndex: 20` централизованно
- Добавлено превью для ссылок (Telegram/Open Graph): meta-теги `og:*`/`twitter:*` и английское описание в `packages/client/index.html`

---

## 1.0.3

### Исправления

- Убран лишний верхний отступ в PWA на iPhone: `safe-area-inset-top` больше не учитывается дважды в `TopContainer`

---

## 1.0.2

### UI

- Заголовок «Just Time Tracker» в хедере (`HeaderAppTitle`) — только с планшетной ширины (≥ 768px)
- На sign in / sign up переливающийся текст заголовка формы — только на мобилке, когда заголовок в хедере скрыт
- NavBar: на телефоне иконка 24px и текст `sm`, на планшете и десктопе — 28px и текст `md`

---

## 1.0.1

### Профиль

- Редактирование профиля: имя и email, режим read-only / edit с кнопками сохранить / отмена
- Фокус на первое поле при входе в режим редактирования, `Esc` отменяет без изменений
- API `PATCH /users/me` для обновления профиля
- Исправлен `/auth`: пользователь берётся из БД, в ответе всегда корректные `name`, `email`, `avatar`

### Авторизация и регистрация

- Валидация пароля при регистрации: 8–64 символа, латиница, минимум одна буква и одна цифра
- После успешной регистрации — редирект на страницу входа
- Исправлен `signIn`: `name` и `avatar` больше не подставляются из `login`

### Сегодняшние активности

- Диалог добавления активностей: минимальная высота при пустом списке, кастомный скролл через `ScrollArea`
- Подгрузка активностей при скролле (`limit: 20`)
- Список не мигает при добавлении активности; порядок сохраняется (без закрепления запущенной сверху)

### История активностей

- Скелетон группы приведён к реальной структуре карточек
- `HistoryActivityCard` вынесен в отдельный модуль со своим скелетоном

### UI и i18n

- Обновлены логотип, favicon, PWA-иконки и manifest
- Вынесены общие стили `shineText` в shared-слой
- Добавлены переводы (en / ru / zh): legal notice на signup, calendar «coming soon», profile, password toggle, toast-сообщения

### Backend

- Схема `users`: колонки `email`, `avatar`, unique constraint на `email`
- Интеграционные тесты для `PATCH /users/me`

### Миграция БД (1.0.1)

На существующих базах нужно один раз выполнить `001_add_users_email_avatar.sql`.  
Инструкция: [update-deploy.md](update-deploy.md#миграции-на-существующей-бд).
