# Docker

Как запускать проект в контейнерах: локально, prod через GHCR и только PostgreSQL для `pnpm dev`.

## Требования

- Docker Desktop (или Docker Engine + Compose v2)
- Файл `.env` в корне репозитория

```bash
cp .env.example .env   # заполните секреты
```

## Какой compose использовать

| Файл | Когда |
|------|-------|
| [`.docker/docker-compose.yaml`](../.docker/docker-compose.yaml) | Только **PostgreSQL** (+ pgAdmin) для локальной разработки через `pnpm dev` |
| [`docker-compose.yml`](../docker-compose.yml) | **Полный стек** локально: сборка client + server + postgres из исходников |
| [`docker-compose.prod.yml`](../docker-compose.prod.yml) | **Prod**: pull готовых образов из GHCR + postgres |

## 1. Только PostgreSQL (для `pnpm dev`)

Самый частый сценарий при разработке: приложение на хосте, БД в Docker.

```bash
docker compose -f .docker/docker-compose.yaml up -d postgres
```

Проверка:

```bash
docker compose -f .docker/docker-compose.yaml ps
```

Данные сохраняются в `.docker/postgres/data/`.

С pgAdmin:

```bash
docker compose -f .docker/docker-compose.yaml up -d
```

- pgAdmin: http://localhost:8080
- Postgres: `localhost:${DB_PORT}` (по умолчанию `5432`)

Остановка:

```bash
docker compose -f .docker/docker-compose.yaml down        # контейнеры, данные сохраняются
docker compose -f .docker/docker-compose.yaml down -v     # + удалить тома (данные БД)
```

Дальше на хосте:

```bash
pnpm dev
```

- Client: http://localhost:3000
- Server: http://localhost:9000

## 2. Полный локальный стек (Docker)

Client + server + postgres, всё собирается из Dockerfile'ов. Браузер ходит только на client; nginx проксирует `/api/*` на server (strip `/api`).

```bash
docker compose up -d --build
```

С pgAdmin:

```bash
docker compose --profile tools up -d --build
```

После запуска:

| Сервис | URL |
|--------|-----|
| App (client + API через `/api`) | http://localhost:3000 (или `${CLIENT_PORT}`) |
| API health | http://localhost:3000/api/health |
| pgAdmin | http://localhost:8080 (profile `tools`) |

PostgreSQL инициализируется автоматически при **первом** создании тома — скрипт [`packages/server/db/init.sql`](../packages/server/db/init.sql) монтируется в `docker-entrypoint-initdb.d`. Для сброса БД: `docker compose down -v` и поднять заново.

Пересборка после изменений кода:

```bash
docker compose up -d --build server client
```

Логи:

```bash
docker compose logs -f server
docker compose logs -f client
```

Остановка:

```bash
docker compose down
```

### Переменные для `docker-compose.yml`

Минимум в `.env`:

```env
DB_NAME=time_tracker
DB_USER=postgres
DB_PASSWORD=change_me
DB_PORT=5432

SERVER_PORT=9000
CLIENT_PORT=3000

ACCESS_TOKEN_SECRET=change_me_access
REFRESH_TOKEN_SECRET=change_me_refresh
ALLOWED_ORIGINS=http://localhost:3000

# Same-origin: один URL для UI и API (/api проксируется nginx)
VITE_APP_URL=http://localhost:3000
VITE_API_ENDPOINT=http://localhost:3000
```

**Важно:** `VITE_*` попадают в статику client при **build**. Если меняете URL API — пересоберите client:

```bash
docker compose up -d --build client
```

Server внутри compose подключается к postgres по hostname `postgres` (переопределяется в compose, не нужно менять `DB_HOST` в `.env` для server-контейнера).

## 3. Prod через GHCR

Образы публикуются автоматически при push в `main`:

- `ghcr.io/<owner>/time-tracker/client:latest`
- `ghcr.io/<owner>/time-tracker/server:latest`

Также создаётся тег с SHA коммита.

### Настройка GitHub Actions Variables

**Settings → Secrets and variables → Actions → Variables:**

| Variable | Пример (один домен) | Назначение |
|----------|---------------------|------------|
| `VITE_APP_URL` | `https://app.example.com` | axios `baseURL`, origin приложения |
| `VITE_API_ENDPOINT` | `https://app.example.com` | тот же URL; refresh и SSE идут через `/api` на том же origin |

### Pull и запуск на сервере

```bash
# если packages приватные
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Prod `.env` (минимум):

```env
DB_NAME=time_tracker
DB_USER=postgres
DB_PASSWORD=<strong>
ACCESS_TOKEN_SECRET=<random>
REFRESH_TOKEN_SECRET=<random>
ALLOWED_ORIGINS=https://app.example.com
GHCR_IMAGE_PREFIX=ghcr.io/alexandrv9/time-tracker
IMAGE_TAG=latest
CLIENT_PORT=80
```

Server **не публикуется** наружу — API доступен только через nginx в client-контейнере (`/api/*`).

Для публичного pull: в настройках package → **Change visibility → Public**.

## 4. Деплой на VPS (один домен, внешний HTTPS)

Схема: Caddy/nginx на хосте → TLS → `localhost:80` (client container) → nginx проксирует `/api` → server.

### 1. Подготовка сервера

```bash
# Docker + Compose v2
curl -fsSL https://get.docker.com | sh

# Клонировать репо (или скопировать docker-compose.prod.yml + .env)
git clone https://github.com/AlexandrV9/ToDoList.git time-tracker
cd time-tracker
cp .env.example .env   # заполнить секреты
```

### 2. Запуск стека

```bash
docker login ghcr.io -u USERNAME -p <PAT_with_read:packages>
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

БД инициализируется автоматически при первом запуске postgres (см. `packages/server/db/init.sql`).

### 3. Caddy на хосте (HTTPS)

```caddy
app.example.com {
    reverse_proxy localhost:80
}
```

Caddy автоматически получит Let's Encrypt сертификат. SSE (`/api/activities/events`) работает без доп. настроек.

### 4. nginx на хосте (альтернатива)

```nginx
server {
    listen 443 ssl;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Для SSE через nginx на хосте добавьте `proxy_buffering off` на location, проксирующий `/api/`.

### 5. Smoke checklist (prod)

| Шаг | Проверка |
|-----|----------|
| Health | `curl https://app.example.com/api/health` → 200 |
| Sign-up / Sign-in | UI + cookie `refresh_token` в DevTools (Secure, HttpOnly) |
| Token refresh | Подождать >3 мин, выполнить действие — не должно выкинуть на `/signin` |
| Activity flow | create → start → pause → finish |
| SSE | Вторая вкладка — события синхронизируются |

## 5. Локальная сборка образов (без compose)

Из корня репозитория:

```bash
docker build -f packages/server/Dockerfile -t time-tracker-server .

docker build -f packages/client/Dockerfile \
  --build-arg VITE_API_ENDPOINT=http://localhost:3000 \
  --build-arg VITE_APP_URL=http://localhost:3000 \
  -t time-tracker-client .
```

Запуск server вручную (нужен postgres и env):

```bash
docker run --rm -p 9000:9000 --env-file .env \
  -e DB_HOST=host.docker.internal \
  -e NODE_ENV=production \
  time-tracker-server
```

Client:

```bash
docker run --rm -p 3000:80 time-tracker-client
```

## Dockerfile'ы

| Образ | Файл | Runtime |
|-------|------|---------|
| Server | `packages/server/Dockerfile` | Node 22, порт 9000 |
| Client | `packages/client/Dockerfile` | nginx, порт 80 |

Оба собираются с **контекстом корня репозитория** (monorepo + `@to-do-list/shared`).

Секреты (`ACCESS_TOKEN_SECRET`, `DB_PASSWORD` и т.д.) **не зашиваются** в образ — передаются через `.env` / `environment` при запуске.

## CI/CD

Workflow: [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml)

```
push main → pnpm verify (lint, test, build) → docker build/push client + server → GHCR
```

Job `verify` поднимает postgres service container для интеграционных тестов.

## Troubleshooting

### `Cannot connect to the Docker daemon`

Запустите Docker Desktop.

### Client не видит API

1. Проверьте `VITE_APP_URL` / `VITE_API_ENDPOINT` — они задаются **при сборке** образа (same-origin: оба = публичный URL приложения)
2. Пересоберите: `docker compose up -d --build client`
3. Проверьте proxy: `curl http://localhost:3000/api/health` должен вернуть 200
4. Для prod: оба `VITE_*` = `https://app.example.com`

### Server не подключается к БД

- В compose: `DB_HOST` должен быть `postgres` (задаётся в `docker-compose.yml`)
- При `pnpm dev` на хосте: `DB_HOST=localhost`

### Порт занят

Измените `DB_PORT`, `SERVER_PORT`, `CLIENT_PORT` в `.env`.

### Очистка

```bash
docker compose down --rmi local    # удалить локально собранные образы проекта
docker system prune -f             # неиспользуемые ресурсы Docker
```

## Связанные документы

- [testing.md](testing.md) — тесты (postgres для Vitest)
- [ARCHITECTURE.md](ARCHITECTURE.md) — архитектура и API
