# TimeTracker

Monorepo для трекера времени: React-клиент, Hono API и общие типы.

## Стек

- **Client** — React, Vite, TanStack Router/Query, Chakra UI (`packages/client`)
- **Server** — Hono, PostgreSQL (`packages/server`)
- **Shared** — общие типы и схемы (`packages/shared`)

## Требования

- Node.js 22+
- [pnpm](https://pnpm.io/) 10.26+
- Docker (для PostgreSQL и Docker-сборки)

## Быстрый старт

```bash
pnpm install
cp .env.example .env   # заполните секреты и параметры БД
```

### 1. Локальная разработка (pnpm)

Поднимите PostgreSQL:

```bash
docker compose -f .docker/docker-compose.yaml up -d postgres
```

Запустите все пакеты:

```bash
pnpm dev
```

- Client: http://localhost:3000
- Server: http://localhost:9000

Отдельные команды:

```bash
pnpm dev:client
pnpm dev:server
pnpm dev:shared
```

### 2. Полный стек в Docker

Сборка и запуск client + server + postgres из исходников:

```bash
docker compose up -d --build
```

С pgAdmin:

```bash
docker compose --profile tools up -d --build
```

## Тестирование

Подробнее: [docs/testing.md](docs/testing.md)

```bash
docker compose -f .docker/docker-compose.yaml up -d postgres
pnpm build:shared
pnpm test          # все тесты server
pnpm verify        # lint + test + build (как в CI)
```

## Линт и сборка

```bash
pnpm lint              # eslint клиента
pnpm build:shared      # общие типы (нужны перед test/build)
pnpm build             # shared + client + server
```

## Docker-образы и деплой

При push в `main` GitHub Actions публикует образы в GHCR:

- `ghcr.io/<owner>/time-tracker/client`
- `ghcr.io/<owner>/time-tracker/server`

Подробнее: [docs/docker.md](docs/docker.md) · [docs/deploy.md](docs/deploy.md)

Продакшен через compose:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

## Структура

```
packages/
  client/   # frontend
  server/   # backend API
  shared/   # общий код
.docker/    # postgres + pgadmin для dev
```
