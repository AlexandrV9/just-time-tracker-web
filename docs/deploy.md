# Деплой на VPS

Пошаговая инструкция: что сделать **до** захода на сервер и **после** первого входа по SSH.

Схема prod:

```
Браузер → https://app.example.com (Caddy, TLS)
       → localhost:80 (client container, nginx)
       → /api/* → server container → postgres
```

Подробности про Docker и образы: [docker.md](docker.md).

---

## Что нужно заранее

| Что | Зачем |
|-----|-------|
| **VPS** | Ubuntu 22.04/24.04, 1–2 GB RAM, 1 vCPU — достаточно для старта |
| **Домен** | Например `app.example.com` → A-запись на IP VPS |
| **GitHub repo** | Код в `main`, CI собирает образы в GHCR |
| **GitHub PAT** | Если packages приватные: scope `read:packages` |

---

## Часть 1. До VPS (на GitHub)

Сделайте это **до** или сразу после покупки домена — client-образ собирается с URL, зашитым на этапе CI.

### 1. GitHub Actions Variables

**Settings → Secrets and variables → Actions → Variables:**

| Variable | Значение |
|----------|----------|
| `VITE_APP_URL` | `https://app.example.com` |
| `VITE_API_ENDPOINT` | `https://app.example.com` |

Оба — один и тот же публичный URL. API ходит через `/api` на том же домене.

### 2. Сборка образов

Смержите изменения в `main`. Workflow [`.github/workflows/docker-publish.yml`](../.github/workflows/docker-publish.yml) выполнит `pnpm verify` и запушит:

- `ghcr.io/alexandrv9/time-tracker/client:latest`
- `ghcr.io/alexandrv9/time-tracker/server:latest`

Проверка: **GitHub → Packages** — оба образа появились после зелёного CI.

### 3. Доступ к GHCR (если packages private)

**Settings → Developer settings → Personal access tokens** → создать token с `read:packages`.

Либо сделайте packages **Public**: package → **Package settings → Change visibility**.

---

## Часть 2. DNS

В панели регистратора домена:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `app` (или `@`) | `<IP вашего VPS>` |

Подождите 5–30 минут, пока DNS обновится. Проверка с локальной машины:

```bash
dig +short app.example.com
# должен вернуть IP VPS
```

---

## Часть 3. На VPS (после входа по SSH)

Подключение:

```bash
ssh root@<IP_VPS>
# или
ssh ubuntu@<IP_VPS>
```

Дальше — по шагам.

### Шаг 1. Обновить систему

```bash
apt update && apt upgrade -y
```

### Шаг 2. Установить Docker

```bash
curl -fsSL https://get.docker.com | sh
```

Проверка:

```bash
docker --version
docker compose version
```

### Шаг 3. Установить Caddy (HTTPS)

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy
```

### Шаг 4. Скопировать файлы проекта

Нужны только compose и env — исходники собирать на сервере не нужно.

**Вариант A — git clone:**

```bash
cd /opt
git clone https://github.com/AlexandrV9/ToDoList.git time-tracker
cd time-tracker
```

**Вариант B — минимум файлов:**

```bash
mkdir -p /opt/time-tracker && cd /opt/time-tracker
# скопируйте с локальной машины:
# scp docker-compose.prod.yml .env.example user@<IP>:/opt/time-tracker/
```

### Шаг 5. Настроить `.env`

```bash
cp .env.example .env
nano .env
```

Заполните prod-значения:

```env
DB_NAME=time_tracker
DB_USER=postgres
DB_PASSWORD=<сгенерируйте_длинный_пароль>

ACCESS_TOKEN_SECRET=<openssl rand -hex 32>
REFRESH_TOKEN_SECRET=<openssl rand -hex 32>
ALLOWED_ORIGINS=https://app.example.com

GHCR_IMAGE_PREFIX=ghcr.io/alexandrv9/time-tracker
IMAGE_TAG=latest
CLIENT_PORT=80
```

Сгенерировать секреты на сервере:

```bash
openssl rand -hex 32   # для ACCESS_TOKEN_SECRET
openssl rand -hex 32   # для REFRESH_TOKEN_SECRET
openssl rand -base64 24  # для DB_PASSWORD
```

### Шаг 6. Войти в GHCR и запустить стек

```bash
cd /opt/time-tracker

# если packages private:
echo "<YOUR_GITHUB_PAT>" | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin

docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Проверка контейнеров:

```bash
docker compose -f docker-compose.prod.yml ps
```

Все три сервиса (`postgres`, `server`, `client`) должны быть `Up`. Postgres — `healthy`.

БД создаётся автоматически при **первом** запуске postgres (`packages/server/db/init.sql`).

Проверка API (пока без HTTPS):

```bash
curl http://localhost/api/health
# {"status":"OK","success":true,...}
```

### Шаг 7. Настроить Caddy (HTTPS)

```bash
nano /etc/caddy/Caddyfile
```

Содержимое:

```caddy
app.example.com {
    reverse_proxy localhost:80
}
```

Замените `app.example.com` на ваш домен. Перезапуск:

```bash
systemctl reload caddy
systemctl status caddy
```

Caddy сам получит Let's Encrypt-сертификат (нужны корректный DNS и открытые порты 80/443).

### Шаг 8. Firewall (рекомендуется)

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

Порт 9000 (server) наружу **не открывайте** — API доступен только через client nginx.

---

## Smoke checklist

| # | Действие | Ожидание |
|---|----------|----------|
| 1 | `curl https://app.example.com/api/health` | `{"status":"OK",...}` |
| 2 | Открыть `https://app.example.com` в браузере | Загружается UI |
| 3 | Sign-up → Sign-in | В DevTools: cookie `refresh_token` (Secure, HttpOnly) |
| 4 | Создать activity → Start → Pause → Finish | Без ошибок |
| 5 | Открыть вторую вкладку, Start в одной | SSE синхронизирует состояние |
| 6 | Подождать >3 мин, выполнить действие | Не выкидывает на `/signin` (refresh token работает) |

---

## Обновление после нового merge в main

На VPS:

```bash
cd /opt/time-tracker
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Если менялись только server/postgres — client пересобирается в CI только при изменениях client. После смены `VITE_*` Variables нужен новый push в `main`, чтобы client-образ пересобрался.

---

## Полезные команды

```bash
# логи
docker compose -f docker-compose.prod.yml logs -f server
docker compose -f docker-compose.prod.yml logs -f client

# перезапуск
docker compose -f docker-compose.prod.yml restart

# остановка
docker compose -f docker-compose.prod.yml down

# остановка + удаление данных БД (осторожно!)
docker compose -f docker-compose.prod.yml down -v
```

---

## Troubleshooting

### `401 password authentication failed` / health ERROR

Неверный `DB_PASSWORD` в `.env` при уже созданном томе postgres. Либо исправьте пароль в `.env` под существующую БД, либо сбросьте том:

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Caddy не выдаёт сертификат

- DNS ещё не обновился — подождите и проверьте `dig`
- Порт 80/443 закрыт firewall или провайдером
- Домен в Caddyfile не совпадает с DNS

### `pull access denied` для GHCR

- `docker login ghcr.io` с PAT (`read:packages`)
- Или сделайте packages public

### Client открывается, API 404

- Образ client собран **до** настройки `VITE_*` Variables — пересоберите через push в `main`
- Проверьте: `curl https://app.example.com/api/health`

### Login не работает (нет cookie)

- Нужен HTTPS — cookie `refresh_token` с `Secure` не сохранится на HTTP
- Проверьте, что заходите через `https://`, не `http://`

---

## Краткий чеклист «что осталось»

```
[ ] Купить VPS
[ ] Купить домен, A-запись → IP VPS
[ ] GitHub Variables: VITE_APP_URL, VITE_API_ENDPOINT = https://ваш-домен
[ ] Merge в main → образы в GHCR
[ ] SSH на VPS → Docker + Caddy
[ ] git clone / scp compose + .env
[ ] docker login ghcr.io → pull → up -d
[ ] Caddyfile → reverse_proxy localhost:80
[ ] Smoke checklist
```
