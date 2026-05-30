# Обновление деплоя

Краткая инструкция: как подтянуть новые образы из GHCR после merge в `main`.

Первичный деплой: [deploy.md](deploy.md).

---

## Когда обновлять

После push в `main` GitHub Actions собирает и публикует образы в GHCR:

- `ghcr.io/alexandrv9/time-tracker/client:latest`
- `ghcr.io/alexandrv9/time-tracker/server:latest`

Дождитесь зелёного CI, затем обновите стек на VPS.

---

## Обновить всё

SSH на VPS:

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

Если менялся только frontend:

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull client
docker compose -f docker-compose.prod.yml --env-file .env up -d client
```

---

## Обновить только server

Если менялся только backend:

```bash
cd /opt/time-tracker

docker compose -f docker-compose.prod.yml --env-file .env pull server
docker compose -f docker-compose.prod.yml --env-file .env up -d server
```

---

## Важно про client-образ

`VITE_APP_URL` и `VITE_API_ENDPOINT` зашиваются в client **при сборке в CI**.

Если вы меняли эти Variables в GitHub:

1. Убедитесь, что после изменения был новый push в `main`
2. Обновите **client** на VPS (см. выше)

Без пересборки client в CI старые URL останутся в статике.

---

## Конкретная версия (по SHA)

В `.env` на VPS:

```env
IMAGE_TAG=<commit-sha>
```

Затем:

```bash
cd /opt/time-tracker
docker compose -f docker-compose.prod.yml --env-file .env pull
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

Чтобы вернуться на `latest`, снова поставьте `IMAGE_TAG=latest`.

---

## Если что-то пошло не так

Логи:

```bash
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f client
```

Откат на предыдущий SHA — через `IMAGE_TAG` (см. выше).

Полный troubleshooting: [deploy.md](deploy.md#troubleshooting).
