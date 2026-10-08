# syntax=docker/dockerfile:1

# ---- Build: render all pages and bundle them with Vite ----------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# The canonical URL comes from content/site.js; pass --build-arg SITE_URL=… to override it.
ARG SITE_URL=
ENV SITE_URL=${SITE_URL}
RUN npm run build \
  # Everything served must be world-readable.
  && chmod -R a+rX dist

# ---- Serve: static files from Caddy (headers, caching, compression in docker/Caddyfile) --------
FROM caddy:2-alpine
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 32773
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:32773/ || exit 1
