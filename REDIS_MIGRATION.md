# Guía de Migración a Redis

Esta guía explica cómo migrar de database a Redis para cache, queue y sessions.

## 🎯 Beneficios

- **Cache**: 100x más rápido para queries repetitivas (settings, configuraciones)
- **Queue**: Procesamiento de jobs más rápido (mensajes programados)
- **Sessions**: Login y navegación más fluida
- **MySQL**: Menos carga en la base de datos

## 📋 Requisitos Previos

1. Redis instalado y corriendo
2. Extensión PHP Redis instalada (`php-redis`)

### Verificar Redis

```bash
# Verificar que Redis está corriendo
redis-cli ping
# Debe responder: PONG

# Verificar extensión PHP
php -m | grep redis
# Debe mostrar: redis
```

### Instalar Redis (si no está instalado)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install redis-server php-redis

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Reiniciar PHP-FPM
sudo systemctl restart php8.5-fpm
```

## 🔧 Configuración

### 1. Actualizar `.env`

```bash
cd /var/www/html/webhook.edgarqs.dev/app
nano .env
```

Agregar/modificar estas líneas:

```env
# Redis Configuration
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_CACHE_CONNECTION=cache
REDIS_QUEUE_CONNECTION=default

# Cache
CACHE_STORE=redis

# Queue
QUEUE_CONNECTION=redis

# Sessions
SESSION_DRIVER=redis
SESSION_STORE=redis
```

### 2. Limpiar Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

### 3. Actualizar Supervisor (Queue Worker)

```bash
sudo nano /etc/supervisor/conf.d/webhookmanager-worker.conf
```

Asegúrate de que el comando incluya `--queue=default`:

```ini
[program:webhookmanager-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/webhook.edgarqs.dev/app/artisan queue:work redis --queue=default --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/html/webhook.edgarqs.dev/app/storage/logs/worker.log
stopwaitsecs=3600
```

Reiniciar Supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl restart webhookmanager-worker:*
```

### 4. Reiniciar Servicios

```bash
# PHP-FPM
sudo systemctl restart php8.5-fpm

# Nginx
sudo systemctl restart nginx
```

## ✅ Verificación

### 1. Verificar Cache

```bash
php artisan tinker
```

```php
// Guardar en cache
Cache::put('test', 'redis works!', 60);

// Leer de cache
Cache::get('test'); // Debe devolver: "redis works!"

// Verificar driver
Cache::getStore()->getRedis()->ping(); // Debe devolver: true

exit
```

### 2. Verificar Queue

```bash
# Ver estado del worker
sudo supervisorctl status webhookmanager-worker:*

# Debe mostrar: RUNNING
```

### 3. Verificar Sessions

```bash
# Iniciar sesión en la aplicación
# Luego verificar en Redis:
redis-cli
keys *session*
# Debe mostrar las sesiones activas
```

### 4. Verificar Redis directamente

```bash
redis-cli

# Ver todas las keys
KEYS *

# Ver info
INFO stats

# Salir
exit
```

## 🔄 Rollback (si hay problemas)

Si algo falla, puedes volver a database:

```bash
nano .env
```

```env
CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
```

```bash
php artisan config:clear
sudo supervisorctl restart webhookmanager-worker:*
sudo systemctl restart php8.5-fpm
```

## 📊 Monitoreo

### Ver uso de Redis

```bash
redis-cli INFO memory
redis-cli INFO stats
```

### Ver keys por tipo

```bash
redis-cli
KEYS *cache*     # Cache keys
KEYS *session*   # Session keys
KEYS *queue*     # Queue keys
```

### Limpiar Redis (si es necesario)

```bash
redis-cli FLUSHDB  # Limpiar base de datos actual
redis-cli FLUSHALL # Limpiar todas las bases de datos
```

## 🎯 Próximos Pasos

Una vez migrado a Redis:

1. ✅ Monitorear rendimiento
2. ✅ Ajustar configuración de TTL si es necesario
3. ✅ Configurar backup de Redis (opcional)
4. ✅ Considerar Redis Sentinel para alta disponibilidad (producción crítica)

## 📝 Notas

- **Sessions**: Al cambiar a Redis, los usuarios con sesiones activas en database serán deslogueados
- **Cache**: Se perderá el cache existente (se regenerará automáticamente)
- **Queue**: Jobs pendientes en database NO se migrarán automáticamente

## 🆘 Troubleshooting

### Error: "Connection refused"

```bash
# Verificar que Redis está corriendo
sudo systemctl status redis-server

# Iniciar si está parado
sudo systemctl start redis-server
```

### Error: "Class 'Redis' not found"

```bash
# Instalar extensión PHP Redis
sudo apt install php-redis
sudo systemctl restart php8.5-fpm
```

### Workers no procesan jobs

```bash
# Ver logs
tail -f /var/www/html/webhook.edgarqs.dev/app/storage/logs/worker.log

# Reiniciar workers
sudo supervisorctl restart webhookmanager-worker:*
```
