# Обновление на VPS

Актуально для **1.1.12**. При обновлении с 1.1.11 новых миграций нет. История релизов: [changelog.md](changelog.md); первоначальная настройка: [deploy.md](deploy.md).

## Автодеплой и ручное обновление

После push в `main` workflow выполняет `pnpm verify`, публикует client/server в GHCR с тегами `latest` и полный SHA коммита, затем запускает SSH deploy. Нужны secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Deploy выполняет в `/opt/time-tracker`:

```bash
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d --remove-orphans
docker compose -f docker-compose.prod.yml --env-file .env ps
docker image prune -f
```

Workflow не обновляет файлы compose, `.env`, `init.sql` или миграции на хосте. Их нужно подготовить отдельно до запуска новой версии. При необходимости миграции сначала сделайте резервную копию БД и примените нужный SQL; автодеплой сам этого не делает.

Ручное обновление всего стека:

```bash
cd /opt/time-tracker
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
docker compose -f docker-compose.prod.yml --env-file .env ps
curl http://localhost:8081/api/health
```

Здесь `8081` — `CLIENT_PORT` из примера с Caddy. Подставьте свой порт. Не используйте порт 80 одновременно для Caddy и client container.

Обновить один сервис:

```bash
docker compose -f docker-compose.prod.yml --env-file .env pull client
docker compose -f docker-compose.prod.yml --env-file .env up -d client
```

Для сервера замените `client` на `server`.

## Переменные окружения

Client-образ получает `VITE_APP_URL`, `VITE_API_ENDPOINT`, `VITE_VAPID_PUBLIC_KEY` **при сборке в CI** из GitHub Actions Variables. Изменение `.env` на VPS не меняет готовую статику. После изменения Variables нужен новый запуск сборки (workflow запускается push в `main`) и обновление client.

Runtime server env: секреты токенов, `DB_*`, `ALLOWED_ORIGINS`, `CLIENT_URL`, SMTP и VAPID. После изменения `.env` пересоздайте server через `up -d server`; простого `restart` недостаточно для применения новых env.

Для Web Push нужны совпадающие `VITE_VAPID_PUBLIC_KEY` клиента и `VAPID_PUBLIC_KEY` сервера, а также `VAPID_PRIVATE_KEY` и `VAPID_SUBJECT`. Для писем — `EMAIL_TRANSPORT=smtp`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`. Полный пример в [deploy.md](deploy.md).

Yandex OAuth в текущем коде отключён: маршруты входа, callback и link закомментированы. Сервис и миграция OAuth сохранены, но `YANDEX_*` не включают endpoints сами по себе. Старый smoke-тест успешного входа через Yandex сейчас неприменим.

## Конкретная версия и откат

В `.env` задайте:

```env
IMAGE_TAG=<полный commit-sha>
```

Затем выполните `pull` и `up -d`. Вернуться на последний образ: `IMAGE_TAG=latest`. Все последующие автодеплои также используют значение `IMAGE_TAG` из `.env` на VPS.

Откат образа не откатывает схему и данные БД; совместимость с применёнными миграциями проверяется отдельно.

## Миграции на существующей БД

`packages/server/db/init.sql` содержит актуальную схему для **пустого** volume. PostgreSQL выполняет его только при первой инициализации. Перезапуск контейнера с существующим volume не применяет изменения SQL. Автоматического migration runner нет.

Применяйте недостающие миграции по порядку:

| Версия | Файл в `packages/server/db/migrations/` | Назначение |
| --- | --- | --- |
| 1.0.1 | `001_add_users_email_avatar.sql` | email и avatar |
| 1.0.6 | `002_email_auth_verification.sql` | OAuth, verification, reset password, лимит писем |
| 1.1.7 | `003_notifications_and_activity_settings.sql` | notification jobs, push subscriptions, activity settings |
| 1.1.9 | `004_users_locale_and_push.sql` | locale и push_notifications_enabled |

Скопируйте нужный SQL на VPS и выполните с данными своей БД:

```bash
docker exec -i time-tracker-postgres psql -v ON_ERROR_STOP=1 \
  -U <DB_USER> -d <DB_NAME> < ~/migration.sql
```

Или, если есть прямой доступ к PostgreSQL:

```bash
psql -v ON_ERROR_STOP=1 -h localhost -U <DB_USER> -d <DB_NAME> -f ~/migration.sql
```

## Проверка после обновления

1. `/api/health` отвечает `status: OK`.
2. Вход, refresh, start/pause/resume/finish работают.
3. История, аналитика, настройки активности и переход назад с выбранной датой работают.
4. Вторая вкладка синхронизируется через SSE; после скрытия/возврата состояние восстанавливается.
5. Письма verification/reset приходят при настроенном SMTP.
6. При настроенном Web Push и разрешении браузера напоминания приходят в PWA, включая закрытое приложение.

Логи:

```bash
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f client
```

Дополнительный troubleshooting: [deploy.md](deploy.md#troubleshooting).
