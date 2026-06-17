# Changelog

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
