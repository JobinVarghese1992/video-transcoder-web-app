# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev=false
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.27-alpine
# static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# our nginx.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

# script that writes /usr/share/nginx/html/env.js from container env vars
COPY deploy/99-env.sh /docker-entrypoint.d/99-env.sh
RUN chmod +x /docker-entrypoint.d/99-env.sh

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:8080/ >/dev/null || exit 1
