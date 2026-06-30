FROM node:22-alpine AS builder

WORKDIR /app

ENV HUSKY=0

RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/client/package.json packages/client/

RUN pnpm install --frozen-lockfile --ignore-scripts --filter @time-tracker/client...

COPY packages/shared packages/shared
COPY packages/client packages/client

RUN pnpm --filter @time-tracker/shared build

ARG VITE_API_ENDPOINT
ARG VITE_APP_URL
ARG VITE_VAPID_PUBLIC_KEY
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY

RUN pnpm --filter @time-tracker/client build

FROM nginx:alpine

COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
