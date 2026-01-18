#!/bin/bash
set -e

# --- CONFIGURACIÓN ---
ROOT_DIR="/var/www/html/webhook.edgarqs.dev"
APP_DIR="$ROOT_DIR/app"
USER="www-data"
GROUP="www-data"

# Comprobamos si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Por favor, ejecuta este script con sudo: sudo ./deploy.sh"
  exit 1
fi

echo "🚀 Iniciando despliegue MAESTRO..."

# 0. MODO MANTENIMIENTO
# Cerramos la tienda para que los usuarios no vean errores durante el proceso
echo "🚫 Activando modo mantenimiento..."
# Usamos '|| true' para que el script no se detenga si ya estaba abajo
sudo -u $USER php artisan down --secret="accesoadmin" || true

# 1. ARREGLAR PERMISOS PREVIOS
echo "🔧 Corrigiendo propiedad de archivos..."
chown -R $USER:$GROUP $ROOT_DIR
git config --global --add safe.directory $ROOT_DIR

# 2. GIT
cd $ROOT_DIR
echo "⬇️ Bajando cambios de Git..."
sudo -u $USER git pull origin main

# 3. BACKEND (Composer)
cd $APP_DIR
echo "📦 Instalando dependencias PHP..."
sudo -u $USER composer install --no-dev --optimize-autoloader

# 4. FRONTEND (NPM + VITE)
echo "⚛️ Compilando React..."

if [ -f "package-lock.json" ]; then
    chown $USER:$GROUP package-lock.json
fi
if [ -d "node_modules" ]; then
    chown -R $USER:$GROUP node_modules
    chmod +x node_modules/.bin/* 2>/dev/null || true
fi

sudo -u $USER npm install
chmod +x node_modules/.bin/* 2>/dev/null || true
sudo -u $USER NODE_ENV=production npm run build

# 5. LARAVEL
echo "🔥 Optimizando Laravel..."
mkdir -p $APP_DIR/storage/framework/{sessions,views,cache}
mkdir -p $APP_DIR/storage/logs
mkdir -p $APP_DIR/bootstrap/cache

chown -R $USER:$GROUP $APP_DIR/storage
chown -R $USER:$GROUP $APP_DIR/bootstrap/cache
chmod -R 775 $APP_DIR/storage
chmod -R 775 $APP_DIR/bootstrap/cache

sudo -u $USER php artisan migrate --force
sudo -u $USER php artisan optimize:clear
sudo -u $USER php artisan config:cache
sudo -u $USER php artisan route:cache
sudo -u $USER php artisan view:cache

# 6. LIMPIEZA FINAL DE PERMISOS (Versión Rápida)
echo "🔒 Blindando seguridad final..."
chown -R $USER:$GROUP $ROOT_DIR

# Usamos xargs e ignoramos node_modules para que esto tarde 1 segundo en vez de 1 minuto
find $ROOT_DIR -type d -not -path "*/node_modules*" -not -path "*/.git*" -print0 | xargs -0 chmod 775
find $ROOT_DIR -type f -not -path "*/node_modules*" -not -path "*/.git*" -print0 | xargs -0 chmod 664

chmod +x $ROOT_DIR/deploy.sh
chmod +x $APP_DIR/node_modules/.bin/* 2>/dev/null || true

# 7. LEVANTAR MODO MANTENIMIENTO
echo "✅ Levantando la web..."
sudo -u $USER php artisan up

echo "🎉 DESPLIEGUE FINALIZADO CON ÉXITO"