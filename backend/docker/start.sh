#!/bin/sh
set -e

# Storage / cache のパーミッション
chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache

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
