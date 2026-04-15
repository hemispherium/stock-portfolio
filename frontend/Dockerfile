# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# ビルド時に API の URL を注入
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ================================
# Stage 2: Production (nginx)
# ================================
FROM nginx:1.27-alpine AS production

# ビルド成果物をコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 用 nginx 設定 (全パスを index.html へフォールバック)
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
