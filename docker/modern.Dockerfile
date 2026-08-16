# FixKart modern frontend - Vite + React, built then served by nginx.
# Build context is the repository root (see docker-compose.yml).

# ---- Stage 1: build the app ----
FROM node:20-alpine AS build
WORKDIR /app

COPY modern-frontend/package.json modern-frontend/package-lock.json ./
RUN npm ci

COPY modern-frontend/ ./
RUN npm run build

# ---- Stage 2: serve it ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/modern.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
