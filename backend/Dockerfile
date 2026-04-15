# ================================
# Stage 1: Composer dependencies
# ================================
FROM composer:2.7 AS composer_bin
FROM php:8.3-cli-alpine AS deps

# composer install に必要な最低限の拡張
RUN apk add --no-cache libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pcntl

COPY --from=composer_bin /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-autoloader \
    --prefer-dist

COPY . .
RUN composer dump-autoload --optimize

# ================================
# Stage 2: Production image
# ================================
FROM php:8.3-fpm-alpine AS production

# システム依存パッケージ
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpq-dev \
    redis \
    autoconf \
    g++ \
    make \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        opcache \
        pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf g++ make

WORKDIR /var/www/html

# Composer の成果物をコピー
COPY --from=deps /app .

# 設定ファイルをコピー
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# 必要なディレクトリを作成
RUN mkdir -p /var/log/supervisor /var/run

# パーミッション設定
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 8000

# デフォルトは web サーバー起動
# Railway の Start Command で上書き可能:
#   worker → php artisan queue:work
#   horizon → php artisan horizon
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
