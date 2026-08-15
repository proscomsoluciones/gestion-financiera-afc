#!/usr/bin/env bash
#
# Deploys the current branch checkout (run on the VPS, inside the project
# directory) to production. Triggered remotely by the "Deploy to VPS"
# GitHub Actions workflow (.github/workflows/deploy.yml).
#
# Safe to re-run: git reset is hard but only affects the tracked working
# copy on the server, never the developer's machine or .env (untracked).

set -euo pipefail

echo "==> [$(date '+%Y-%m-%d %H:%M:%S')] Deploy started"

echo "==> Fetching latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Installing PHP dependencies"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Installing and building frontend assets"
npm ci
npm run build

echo "==> Enabling maintenance mode"
php artisan down --retry=15 || true

echo "==> Running database migrations"
php artisan migrate --force

echo "==> Syncing roles and permissions (idempotent, never touches passwords)"
php artisan db:seed --class=RoleSeeder --force

echo "==> Rebuilding caches"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Restarting queue workers (picks up new code)"
php artisan queue:restart || true

echo "==> Disabling maintenance mode"
php artisan up

echo "==> [$(date '+%Y-%m-%d %H:%M:%S')] Deploy finished successfully"
