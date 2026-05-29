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

Client + server + postgres, всё собирается из Dockerfile'ов.

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
| Client | http://localhost:3000 (или `${CLIENT_PORT}`) |
| Server | http://localhost:9000 (или `${SERVER_PORT}`) |
| pgAdmin | http://localhost:8080 (profile `tools`) |

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

# Зашиваются в client-образ при сборке (Vite)
VITE_API_ENDPOINT=http://localhost:9000
VITE_APP_URL=http://localhost:9000
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

| Variable | Пример | Назначение |
|----------|--------|------------|
| `VITE_API_ENDPOINT` | `https://api.example.com` | URL API для сборки client |
| `VITE_APP_URL` | `https://api.example.com` | axios `baseURL` |

### Pull и запуск на сервере

```bash
# если packages приватные
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Prod `.env` (дополнительно к секретам):

```env
GHCR_IMAGE_PREFIX=ghcr.io/alexandrv9/time-tracker
IMAGE_TAG=latest
CLIENT_PORT=80
SERVER_PORT=9000
```

Для публичного pull: в настройках package → **Change visibility → Public**.

## 4. Локальная сборка образов (без compose)

Из корня репозитория:

```bash
docker build -f packages/server/Dockerfile -t time-tracker-server .

docker build -f packages/client/Dockerfile \
  --build-arg VITE_API_ENDPOINT=http://localhost:9000 \
  --build-arg VITE_APP_URL=http://localhost:9000 \
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

1. Проверьте `VITE_API_ENDPOINT` / `VITE_APP_URL` — они задаются **при сборке** образа
2. Пересоберите: `docker compose up -d --build client`
3. Для prod: URL должны указывать на реальный API, доступный из браузера пользователя

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
