#!/bin/sh
set -e

# Railway が PORT を注入する（デフォルト 8000）
export PORT="${PORT:-8000}"
echo "Using PORT=${PORT}"

# Storage / cache のパーミッション
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

# nginx.conf の ${PORT} を実際のポート番号に展開
envsubst '${PORT}' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp
mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf

# DB の準備ができるまで最大60秒待つ
echo "Waiting for database..."
for i in $(seq 1 30); do
  if php artisan migrate:status --no-interaction > /dev/null 2>&1; then
    echo "Database is ready."
    break
  fi
  echo "  attempt $i/30..."
  sleep 2
done

# マイグレーション実行
echo "Running migrations..."
php artisan migrate --force --no-interaction 2>&1 || echo "Migration warning (may already be up to date)"

# サービス起動
echo "Starting supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
