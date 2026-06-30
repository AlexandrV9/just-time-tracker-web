FROM node:22-alpine AS builder

WORKDIR /app

ENV HUSKY=0

RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/

RUN pnpm install --frozen-lockfile --ignore-scripts --filter @time-tracker/server...

COPY packages/shared packages/shared
COPY packages/server packages/server

RUN pnpm --filter @time-tracker/shared build
RUN pnpm --filter @time-tracker/server build

FROM node:22-alpine AS runner

WORKDIR /app

ENV HUSKY=0
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter @time-tracker/server...

COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/server/dist packages/server/dist

WORKDIR /app/packages/server

EXPOSE 9000

CMD ["node", "dist/src/index.js"]
