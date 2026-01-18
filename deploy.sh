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

# 0. PREPARATIVOS CRÍTICOS
# Arreglamos permisos de la caché de NPM para evitar el error "EACCES"
echo "🔧 Arreglando caché de NPM..."
mkdir -p /var/www/.npm
chown -R $USER:$GROUP /var/www/.npm

# 1. MODO MANTENIMIENTO
# Primero entramos a la carpeta de la APP, si no artisan falla
cd $APP_DIR
echo "🚫 Activando modo mantenimiento..."
sudo -u $USER php artisan down || true

# 2. GIT (Volvemos a la raíz para git)
cd $ROOT_DIR
echo "🔧 Corrigiendo propiedad de archivos..."
chown -R $USER:$GROUP $ROOT_DIR
git config --global --add safe.directory $ROOT_DIR

echo "⬇️ Bajando cambios de Git..."
# Usamos fetch + reset para evitar conflictos
sudo -u $USER git fetch origin main
sudo -u $USER git reset --hard origin/main

# 3. BACKEND (Composer)
cd $APP_DIR
echo "📦 Instalando dependencias PHP..."
sudo -u $USER composer install --no-dev --optimize-autoloader

# 4. FRONTEND (NPM + VITE)
echo "⚛️ Compilando React..."

# Limpieza preventiva de node_modules si existen permisos raros
if [ -d "node_modules" ]; then
    chown -R $USER:$GROUP node_modules
    chmod +x node_modules/.bin/* 2>/dev/null || true
fi
if [ -f "package-lock.json" ]; then
    chown $USER:$GROUP package-lock.json
fi

# Instalación
sudo -u $USER npm install
# Asegurar binarios
chmod +x node_modules/.bin/* 2>/dev/null || true
# Build
sudo -u $USER NODE_ENV=production npm run build

# 5. LARAVEL
echo "🔥 Optimizando Laravel..."
# Crear carpetas necesarias
mkdir -p $APP_DIR/storage/framework/{sessions,views,cache}
mkdir -p $APP_DIR/storage/logs
mkdir -p $APP_DIR/bootstrap/cache

# Permisos explícitos para storage
chown -R $USER:$GROUP $APP_DIR/storage
chown -R $USER:$GROUP $APP_DIR/bootstrap/cache
chmod -R 775 $APP_DIR/storage
chmod -R 775 $APP_DIR/bootstrap/cache

# Comandos Artisan
sudo -u $USER php artisan migrate --force
sudo -u $USER php artisan optimize:clear
sudo -u $USER php artisan config:cache
sudo -u $USER php artisan route:cache
sudo -u $USER php artisan view:cache

# 6. LIMPIEZA FINAL DE PERMISOS
echo "🔒 Blindando seguridad final..."
chown -R $USER:$GROUP $ROOT_DIR
# Usamos xargs (versión rápida)
find $ROOT_DIR -type d -not -path "*/node_modules*" -not -path "*/.git*" -print0 | xargs -0 chmod 775
find $ROOT_DIR -type f -not -path "*/node_modules*" -not -path "*/.git*" -print0 | xargs -0 chmod 664

# Permisos ejecutables
chmod +x $ROOT_DIR/deploy.sh
chmod +x $APP_DIR/node_modules/.bin/* 2>/dev/null || true

# 7. LEVANTAR MODO MANTENIMIENTO
echo "✅ Levantando la web..."
sudo -u $USER php artisan up

echo "🎉 DESPLIEGUE FINALIZADO CON ÉXITO"