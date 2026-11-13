#!/usr/bin/env bash
# Activa en el servidor una versión de la API ya copiada en releases/<version>.
# Lo ejecuta GitHub Actions como usuario deploy. Uso:
#   activar.sh <version>     publica esa versión
#   activar.sh rollback      vuelve a la versión anterior
set -euo pipefail

BASE=/var/www/clientes/asociacion-futbol-catemu/erp/gestion-financiera-afc
SITIO=finanzas.asociaciondefutbolcatemu.cl
CONSERVAR=5

cambiar_a() {
  ln -sfn "$1" "$BASE/current.nuevo"
  mv -Tf "$BASE/current.nuevo" "$BASE/current"
  sudo systemctl reload php8.4-fpm
}

responde() {
  sleep 1
  curl -fsS -o /dev/null --max-time 10 -H "Host: $SITIO" http://127.0.0.1/up
}

anterior() {
  local actual
  actual=$(readlink -f "$BASE/current" || true)
  ls -1d "$BASE"/releases/*/ | sed 's#/$##' | sort | grep -vx "$actual" | tail -1
}

if [ "${1:-}" = "rollback" ]; then
  VOLVER=$(anterior)
  [ -n "$VOLVER" ] || { echo "No hay versión anterior"; exit 1; }
  cambiar_a "$VOLVER"
  echo "Volvió a $(basename "$VOLVER")"
  exit 0
fi

VERSION=${1:?Falta la versión}
RELEASE=$BASE/releases/$VERSION
cd "$RELEASE"

# Lo que se mantiene entre versiones: .env y storage (logos, escudos, comprobantes, logs)
rm -rf storage
ln -s ../../shared/storage storage
ln -sfn ../../shared/.env .env
ln -sfn ../storage/app/public public/storage

# Respaldo de la base antes de migrar (se guardan los últimos 10)
DB_DATABASE=$(sed -n 's/^DB_DATABASE=//p' .env)
DB_USERNAME=$(sed -n 's/^DB_USERNAME=//p' .env)
MYSQL_PWD=$(sed -n 's/^DB_PASSWORD=//p' .env) mariadb-dump -h 127.0.0.1 -u "$DB_USERNAME" \
  --single-transaction --routines "$DB_DATABASE" | gzip > ~/respaldos-deploy/afc-finanzas-"$VERSION".sql.gz
ls -1t ~/respaldos-deploy/afc-finanzas-*.sql.gz | tail -n +11 | xargs -r rm --

# La base de producción se importa a mano: mientras esté vacía no se crean tablas
TABLAS=$(MYSQL_PWD=$(sed -n 's/^DB_PASSWORD=//p' .env) mariadb -h 127.0.0.1 -u "$DB_USERNAME" -N \
  -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_DATABASE'")
if [ "$TABLAS" -gt 0 ]; then
  php artisan migrate --force
  # Roles y permisos (idempotente, no toca contraseñas)
  php artisan db:seed --class=RoleSeeder --force
else
  echo "Base $DB_DATABASE vacía: no se migra (falta importar el respaldo)"
fi
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

PREVIA=$(readlink -f "$BASE/current" 2>/dev/null || true)
cambiar_a "$RELEASE"

if ! responde; then
  echo "La versión nueva no responde en /up"
  if [ -n "$PREVIA" ] && [ -d "$PREVIA" ]; then
    cambiar_a "$PREVIA"
    echo "Se volvió a $(basename "$PREVIA"). Respaldo de la base: ~/respaldos-deploy/afc-finanzas-$VERSION.sql.gz"
  fi
  exit 1
fi

# Versiones antiguas: se guardan las últimas $CONSERVAR para poder volver atrás
ls -1d "$BASE"/releases/*/ | sort | head -n -"$CONSERVAR" | xargs -r rm -rf --
echo "Publicada la versión $VERSION"
