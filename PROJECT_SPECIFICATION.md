# Discord Webhook Manager - Especificación del Proyecto

> **Fuente de la Verdad del Proyecto**  
> Este documento define la funcionalidad completa, arquitectura y directrices para el desarrollo del Discord Webhook Manager. Debe mantenerse actualizado con cada cambio significativo en el proyecto.

---

## 📋 Descripción General

**Discord Webhook Manager** es una aplicación web completa para la gestión, personalización, programación y envío de webhooks de Discord. Permite a los usuarios crear mensajes personalizados con embeds, botones, y otros componentes de Discord, programar envíos automáticos, guardar plantillas reutilizables, y colaborar con otros usuarios.

### Objetivo Principal
Proporcionar una plataforma intuitiva y potente para gestionar webhooks de Discord de manera profesional, con capacidades de automatización, colaboración y personalización avanzada.

### Visión Futura
Integración de IA para la generación automática de contenido de mensajes, sugerencias inteligentes y optimización de comunicaciones.

---

## 🎯 Funcionalidades Principales

### 1. Sistema de Autenticación y Usuarios
- **Login/Registro seguro** con validación de email
- **Gestión de perfiles** de usuario
- **Roles y permisos**:
  - Usuario propietario (owner)
  - Usuario colaborador con permisos de gestión
  - Usuario colaborador con acceso limitado
- **Sistema de invitaciones** para compartir acceso a webhooks

### 2. Gestión de Webhooks ✅ IMPLEMENTADO
- **Crear y almacenar webhooks** de Discord ✅
  - Validación automática con Discord API
  - Auto-rellenado de nombre y avatar desde Discord
  - Detección de webhooks duplicados con opción de crear de todos modos
- **Organización de webhooks** por categorías/proyectos
- **Configuración personalizada**: ✅
  - Nombre del webhook
  - Avatar personalizado (URL)
  - URL del webhook de Discord (validado, soporta `discord.com` y `discordapp.com`)
  - Descripción y etiquetas (tags)
  - Metadatos de Discord (guild_id, channel_id)
- **Compartir webhooks** con otros usuarios (con diferentes niveles de permisos)
- **Historial de envíos** por webhook ✅

### 3. Creador de Mensajes Avanzado ✅ IMPLEMENTADO
- **Editor visual** de mensajes de Discord con vista previa en tiempo real ✅
- **Dos modos de envío**: ✅
  - **Webhook existente**: Selección desde dropdown con preview
  - **Webhook temporal**: URL directa sin guardar, con nombre y avatar personalizables
- **Componentes soportados**: ✅ COMPLETO
  - Contenido de texto simple (máx. 2000 caracteres) ✅
  - Embeds personalizables (máx. 10): ✅ COMPLETO
    - Título (máx. 256 caracteres) y URL ✅
    - Descripción (máx. 4096 caracteres) ✅
    - Color personalizable ✅
    - Autor, Footer, Timestamp, Imagen, Thumbnail ✅
    - Fields (inline soportado) ✅
- **Soporte para Menciones** (@users, @roles, @everyone) ✅
- **Validación en tiempo real** contra límites de Discord API ✅

### 4. Sistema de Plantillas ✅ IMPLEMENTADO
- **Guardar mensajes como plantillas** reutilizables ✅
- **Categorización y compartición** de plantillas ✅
- **Variables dinámicas** ({{date}}, {{username}}, etc.) ✅
- **Biblioteca de plantillas** con vista previa y acciones rápidas ✅

### 5. Programación y Automatización (Scheduled Messages) ⭐ NUEVO
- **Tipos de Programación**:
  - **Envío único**: Fecha y hora específica.
  - **Recurrente**: Diario, Semanal, Mensual (con soporte para pausar/reanudar).
- **Archivos Adjuntos**:
  - Soporte para adjuntar imágenes/videos (máx. 10MB).
  - Almacenamiento en `storage/app/scheduled_messages/`.
  - **Auto-eliminación**: Los archivos se borran automáticamente tras el envío para ahorrar espacio.
- **Integración con Plantillas**: Cargar contenido desde plantillas guardadas.
- **Soporte de Zona Horaria**: Manejo completo de timezones (Default: Europe/Madrid).
- **Estado y Monitoreo**: Tracking de estados (pendiente, procesando, completado, fallido, pausado).

### 6. Sistema de Colaboración ⭐ NUEVO
- **Invitar usuarios** por email con tokens únicos ✅
- **Niveles de permisos**:
  - **Admin**: Gestión total + invitar otros.
  - **Editor**: Editar webhook y enviar mensajes.
  - **Viewer**: Solo lectura e historial.
- **Gestión de Invitaciones**: Aceptar, rechazar o cancelar desde el dashboard ✅.
- **Abandonar**: Los colaboradores pueden abandonar recursos compartidos ✅.
- **Panel de Administración - Mensajes Programados**:
  - **Vista Global**: Los administradores pueden ver todos los mensajes programados de todos los usuarios.
  - **Filtros Avanzados**: Por usuario, estado (pendiente, pausado, completado, fallido), tipo (único/recurrente), webhook, y rango de fechas.
  - **Gestión Completa**:
    - Pausar/Reanudar mensajes programados de cualquier usuario.
    - Eliminar mensajes programados (con confirmación).
    - Ver detalles completos (contenido, archivos adjuntos, historial de envíos).
  - **Estadísticas**: Total de mensajes programados activos, pausados, completados y fallidos por usuario.

### 7. Generación de Contenido con IA ⭐ NUEVO
- **Motores Soportados**: OpenAI (GPT) y Google Gemini.
- **Integración**: Disponible en todos los editores (Quick Send, Webhooks, Templates).
- **Funcionalidad**: Generar títulos, descripciones y contenido de mensajes automáticamente.
- **Control de Acceso**:
  - Flag `can_use_ai` en tabla de usuarios.
  - Límites de uso diario configurables por usuario.
  - UI minimalista "ghost" con animaciones premium.

### 8. Página de Changelog ⭐ NUEVO
- **Historial de Versiones**: Visualización cronológica de actualizaciones.
- **Categorías**: Features, Improvements, Fixes.
- **Modal "What's New"**: Notificación automática de nuevas versiones al usuario.

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico Actualizado
- **Backend**: Laravel 12.x / PHP 8.4+
- **Database**: MySQL 8.0+
- **Frontend**: React + TypeScript + Inertia.js
- **UI Library**: Shadcn UI + Tailwind CSS
- **Workers**: Laravel Queue (Database/Redis) + Laravel Scheduler (Cron)
- **Analytics**: Matomo Tag Manager (opcional, configurado via variables de entorno)

### Estructura de Archivos (Clave)
```
app/
├── app/
│   ├── Console/Commands/
│   │   └── ProcessScheduledMessages.php (Procesa envíos programados)
│   ├── Jobs/
│   │   └── SendScheduledMessage.php (Ejecuta el envío a Discord)
│   ├── Services/
│   │   ├── DiscordMessageService.php (Lógica de API Discord)
│   │   └── AiService.php (Integración OpenAI/Gemini)
│   ├── Models/
│   │   ├── ScheduledMessage.php
│   │   ├── ScheduledMessageFile.php
│   │   └── AiUsage.php
├── resources/js/
│   ├── components/ (UI Compartida)
│   ├── Pages/ (Vistas Inertia)
│   └── data/changelog.ts (Fuente de datos del historial)
└── docker-compose.yml (Infraestructura local)
```

### Esquema de Base de Datos
#### Core
- `users`: Cuentas de usuario (incluye flag `can_use_ai`).
- `webhooks`: Configuraciones de webhooks.
- `webhook_history`: Historial de envíos.
- `templates`: Plantillas de mensajes.

#### Automatización & IA
- `scheduled_messages`: Configuración de envíos programados (recurrencia, estado).
- `scheduled_message_files`: Archivos adjuntos temporales.
- `ai_usages`: Tracking de uso de IA por usuario.

#### Colaboración
- `webhook_collaborators`: Relación Users <-> Webhooks.
- `template_collaborators`: Relación Users <-> Templates.
- `invitations`: Invitaciones pendientes (email, token, expiración).

### Sistema de Mensajes Programados (Deep Dive)
1.  **Cron**: Ejecuta `php artisan schedule:run` cada minuto.
2.  **Scheduler**: Lanza el comando `scheduled-messages:process`.
3.  **Command**: Busca mensajes donde `next_send_at <= now()`.
4.  **Job**: Despacha `SendScheduledMessage` a la cola.
5.  **Worker**:
    *   Envía el payload a Discord (multipart si hay archivos).
    *   Si es recurrente: Calcula `next_send_at` y actualiza.
    *   Si es único: Marca como `completed`.
    *   **Limpieza**: Elimina archivos físicos adjuntos tras el envío.

---

## 🚀 Requisitos de Despliegue

### Entorno de Producción
1.  **Servidor Web**: Nginx/Apache.
2.  **PHP**: 8.4+.
3.  **Base de Datos**: MySQL 8.0+.
4.  **Redis**: Para cache, queue y sessions (mejora significativa de rendimiento).
5.  **Supervisor**: Esencial para mantener corriendo `php artisan queue:work --queue=default`.
6.  **Cron**: Entrada obligatoria: `* * * * * php /path/to/app/artisan schedule:run`.

### Variables de Entorno Clave (.env)
```env
APP_URL=https://tudominio.com
DB_CONNECTION=pgsql
QUEUE_CONNECTION=database # o redis
MAIL_MAILER=smtp          # Para invitaciones
# Credenciales opcionales
OPENAI_API_KEY=...
GEMINI_API_KEY=...
```

---

## 🎨 Diseño y UX

### Principios de Diseño
1.  **Interfaz Moderna**: Glassmorphism, gradientes sutiles y modo oscuro por defecto.
2.  **Feedback Inmediato**: Validaciones en tiempo real y Toast notifications.
3.  **Diseño Compacto**: Cards de alta densidad para listar webhooks/templates.
4.  **Navegación Intuitiva**: Sidebar inteligente y Breadcrumbs en todas las páginas.

---

## 🤖 Directrices para IA (Desarrollo Asistido)

### Contexto
*   **Seguridad Primero**: Nunca hardcodear credenciales. Usar `.env`.
*   **Validación**: Frontend (Zod) + Backend (FormRequests).
*   **Documentación**: Actualizar este archivo si hay cambios arquitectónicos.

---

## 📝 Roadmap & Estado

### ✅ Completado
*   Sistema de Usuarios y Autenticación.
*   CRUD Webhooks y Templates.
*   Editor de Mensajes (Embeds, Menciones).
*   Sistema de Colaboración (Invitaciones).
*   Mensajes Programados (Únicos y Recurrentes).
*   Integración Básica de IA.

### 🔄 En Progreso
*   Refinamiento de UI móvil.
*   Más proveedores de IA.

### 📋 Pendiente
*   API Pública para desarrolladores.
*   Analíticas avanzadas de clicks/interacción.

---

## 📝 Changelog Reciente

- **v1.5 (2026-02-02)**: Integración de Matomo Tag Manager para analytics.
- **v1.4 (2026-01-XX)**: Generación de contenido con IA (OpenAI/Gemini) y límites de uso.
- **v1.3**: Soporte para menciones (@user, @role) y mejoras de UI.
- **v1.2**: Sistema completo de Mensajes Programados (Recurring/One-time).
- **v1.1**: Sistema de Colaboración (Invitaciones y Permisos).
- **v1.0**: Release inicial (Webhooks, Templates, Quick Send).
