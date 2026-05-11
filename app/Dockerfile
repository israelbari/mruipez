# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies stage ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# ---- Build stage ----
FROM deps AS build

# Build-time arguments for Vite (injected into frontend at build time)
ARG VITE_KIMI_AUTH_URL
ARG VITE_APP_ID
ENV VITE_KIMI_AUTH_URL=${VITE_KIMI_AUTH_URL}
ENV VITE_APP_ID=${VITE_APP_ID}

COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine AS production
WORKDIR /app

# Install netcat for waiting on MySQL
RUN apk add --no-cache netcat-openbsd

# Copy dependencies (includes devDeps so drizzle-kit is available for migrations)
COPY --from=deps /app/node_modules ./node_modules

# Copy built application and required assets
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/db ./db

# Copy package metadata, drizzle config and entrypoint
COPY package.json ./
COPY drizzle.config.ts ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
