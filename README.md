# Discord Webhook Manager

**Discord Webhook Manager** es una aplicación web potente y moderna construida con Laravel y React para gestionar, programar y enviar mensajes profesionales a través de Webhooks de Discord. Permite la colaboración en equipos, el uso de plantillas avanzadas y la automatización de envíos.

![Webhook Manager Cover](https://imgur.com/WQeZsX5.png)

---

## 🚀 Funcionalidades Principales

*   **Gestión de Webhooks**: Crea, valida y organiza tus webhooks de Discord. Importa avatares automáticamente.
*   **Editor Visual Avanzado**: Diseña mensajes con Embeds, colores, autor, footer, timestamp y menciones (@user, @everyone) con vista previa en tiempo real idéntica a Discord.
*   **Mensajes Programados**: 
    *   **Envíos Únicos**: Programa mensajes para una fecha exacta.
    *   **Recurrentes**: Configura repeticiones diarias, semanales o mensuales.
    *   **Archivos Adjuntos**: Sube imágenes o videos (hasta 10MB) que se envían y auto-eliminan para ahorrar espacio.
*   **Plantillas Reutilizables**: Guarda tus diseños frecuentes con variables dinámicas (`{{username}}`, `{{date}}`).
*   **Colaboración en Equipo**: Invita usuarios a tus webhooks con roles granulares (Admin, Editor, Viewer).
*   **Generación con IA**: Usa OpenAI o Google Gemini para redactar contenido automáticamente (títulos, descripciones).
*   **Historial de Envíos**: Registro detallado de cada mensaje enviado con estado y respuesta de la API.
*   **Interfaz Premium**: Diseño moderno con Shadcn UI, modo oscuro, animaciones y glassmorphism.

---

## 🛠️ Stack Tecnológico

*   **Backend**: Laravel 12.x (PHP 8.4)
*   **Base de Datos**: PostgreSQL
*   **Frontend**: React + TypeScript (Inertia.js)
*   **Cola de Trabajos**: Redis (recomendado) o Database
*   **Servidor Web Recomendado**: Nginx + Ubuntu Server

---

## 📦 Guía de Despliegue en Ubuntu Server

Esta guía asume que tienes un servidor **Ubuntu 22.04/24.04** limpio.

### 1. Requisitos del Sistema
Asegúrate de tener instalado:
*   Git, Curl, Unzip
*   **PHP 8.4** con extensiones: `BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, PDO_PgSQL, Tokenizer, XML, Curl, Zip`.
*   **Composer** (Gestor de paquetes PHP).
*   **Node.js 20+ & NPM**.
*   **PostgreSQL 14+**.
*   **Nginx** (Servidor Web).
*   **Supervisor** (Gestor de procesos para colas).

### 2. Configuración Inicial
Clona el repositorio y prepara el entorno:

```bash
cd /var/www
git clone https://github.com/tu-usuario/discord-webhook-manager.git
cd discord-webhook-manager

# Instalar dependencias PHP
composer install --optimize-autoloader --no-dev

# Instalar dependencias JS
npm install
npm run build
```

### 3. Configuración del Entorno (.env)
Copia el archivo de ejemplo y configúralo (¡NO USES CREDENCIALES POR DEFECTO!):

```bash
cp .env.example .env
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
php artisan key:generate
```

Edita el `.env` (`nano .env`) con tus datos:

```ini
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tudominio.com

# Base de Datos
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=discord_webhook
DB_USERNAME=tu_usuario_db
DB_PASSWORD=tu_password_db

# Colas (Esencial para mensajes programados)
QUEUE_CONNECTION=database 
# O usa 'redis' si tienes Redis instalado (recomendado para producción)

# Correo (Para invitaciones)
MAIL_MAILER=smtp
MAIL_HOST=smtp.tuservidor.com
MAIL_PORT=587
MAIL_USERNAME=tu_usuario_smtp
MAIL_PASSWORD=tu_password_smtp
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@tudominio.com"
```

### 4. Base de Datos
Ejecuta las migraciones para crear las tablas:

```bash
php artisan migrate --force
```

### 5. Configurar Nginx
Crea un archivo en `/etc/nginx/sites-available/discord-manager`:

```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /var/www/discord-webhook-manager/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Activa el sitio y reinicia Nginx:
```bash
ln -s /etc/nginx/sites-available/discord-manager /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 6. Configurar Worker (Supervisor) ⚠️ CRÍTICO
Para que los mensajes programados se envíen, necesitas un worker corriendo en segundo plano.

Instala Supervisor:
```bash
apt install supervisor
```

Crea `/etc/supervisor/conf.d/discord-worker.conf`:

```ini
[program:discord-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/discord-webhook-manager/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/discord-webhook-manager/storage/logs/worker.log
stopwaitsecs=3600
```

Inicia el proceso:
```bash
supervisorctl reread
supervisorctl update
supervisorctl start discord-worker:*
```

### 7. Configurar Cron (Scheduler) ⚠️ CRÍTICO
El scheduler de Laravel necesita ejecutarse cada minuto para disparar los mensajes programados.

Edita el crontab del usuario `www-data`:
```bash
crontab -u www-data -e
```

Añade esta línea al final:
```bash
* * * * * cd /var/www/discord-webhook-manager && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🔍 Monitoreo y Mantenimiento

*   **Logs de Aplicación**: `tail -f storage/logs/laravel.log`
*   **Logs del Worker**: `tail -f storage/logs/worker.log`
*   **Estado de la Cola**: `php artisan queue:monitor`
*   **Limpieza Automática**: El sistema borra automáticamente los archivos adjuntos de mensajes programados después de enviarlos.

## 👥 Contribuir
Las Pull Requests son bienvenidas. Para cambios importantes, abre primero un issue para discutir lo que te gustaría cambiar.

## 📄 Licencia
[MIT](https://choosealicense.com/licenses/mit/)
