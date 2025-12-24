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
  - URL del webhook de Discord (validado)
  - Descripción y etiquetas (tags)
  - ~~Estado activo/inactivo~~ **ELIMINADO** - Todos los webhooks están siempre activos
  - Metadatos de Discord (guild_id, channel_id)
- **Compartir webhooks** con otros usuarios (con diferentes niveles de permisos)
- **Historial de envíos** por webhook ✅
  - Registro completo de mensajes enviados
  - Estado (éxito/fallo)
  - Payload y respuesta de Discord
  - Usuario que envió el mensaje
  - Fecha y hora de envío

### 3. Creador de Mensajes Avanzado ✅ IMPLEMENTADO
- **Editor visual** de mensajes de Discord con vista previa en tiempo real ✅
- **Dos modos de envío**: ✅
  - **Webhook existente**: Selección desde dropdown con preview
  - **Webhook temporal**: URL directa sin guardar, con nombre y avatar personalizables
- **Componentes soportados**: ✅ COMPLETO
  - Contenido de texto simple (máx. 2000 caracteres) ✅
  - Embeds personalizables (máx. 10): ✅ COMPLETO
    - Título (máx. 256 caracteres) ✅
    - Título URL (para hacer el título clickeable) ✅
    - Descripción (máx. 4096 caracteres) ✅
    - Color personalizable con selector visual ✅
    - Author (nombre, URL, icono) ✅
    - Footer (texto, icono) ✅
    - Timestamp (fecha/hora actual) ✅
    - Image (imagen grande) ✅
    - Thumbnail (imagen pequeña en esquina superior derecha) ✅
    - Fields (nombre, valor, inline) - Máx. 25 por embed ✅
    - Secciones colapsables para mejor organización ✅
  - Botones interactivos (Action Rows): 🔄 PENDIENTE
    - Botones de enlace
    - Botones personalizados
- **Vista previa en tiempo real** estilo Discord ✅
  - Simulación exacta del aspecto en Discord
  - Actualización instantánea al editar
  - Muestra avatar y nombre del webhook
  - Renderizado completo de embeds con todos los campos
  - Posicionamiento correcto de thumbnails
  - Preview sticky que permanece visible al hacer scroll
- **Validación en tiempo real** contra límites de Discord API ✅
  - Contador de caracteres en tiempo real
  - Validación de límites (2000 chars contenido, 256 título, 4096 descripción)
  - Máximo 10 embeds por mensaje
  - Máximo 25 fields por embed
  - Mensajes de error descriptivos
- **Notificaciones de envío** ✅
  - Toast notifications en esquina superior derecha
  - Mensajes de éxito (verde) y error (rojo)
  - Auto-desaparece después de 5 segundos
  - Botón para cerrar manualmente
  - Sistema de flash messages integrado con Inertia.js
  - Limpieza automática del formulario tras éxito

### 4. Sistema de Plantillas ✅ IMPLEMENTADO
- **Guardar mensajes como plantillas** reutilizables ✅
- **Biblioteca de plantillas** personales ✅
- **Categorización de plantillas** (anuncios, notificaciones, alertas, etc.) ✅
- **Plantillas compartidas** entre colaboradores ✅
- **Variables dinámicas** en plantillas (fecha, hora, nombre de usuario, etc.) ✅
  - 9 variables disponibles: {{date}}, {{time}}, {{datetime}}, {{username}}, {{user_email}}, {{webhook_name}}, {{day}}, {{month}}, {{year}}
  - Reemplazo automático al usar plantillas
  - Componente VariableHelper con UI para copiar variables
- **Página de detalles de template** ✅
  - Preview del mensaje estilo Discord con fondo oscuro
  - Renderizado completo de embeds (colores, títulos, descripciones, fields, imágenes)
  - Metadata del template (autor, fecha, categoría)
  - Acciones rápidas según permisos (Use, Edit, Duplicate, Share, Delete/Leave)
  - Cards clickeables para navegación rápida
- **Importar/exportar plantillas** en formato JSON 🔄 PENDIENTE

### 5. Programación y Automatización
- **Programar envíos únicos**:
  - Fecha y hora específica
  - Zona horaria del usuario
- **Envíos recurrentes**:
  - Diario, semanal, mensual
  - Días específicos de la semana
  - Horas específicas del día
- **Cola de envíos programados** con vista de calendario
- **Gestión de tareas programadas**:
  - Pausar/reanudar
  - Editar antes del envío
  - Cancelar
  - Ver historial
- **Notificaciones** de envíos exitosos/fallidos

### 6. Colaboración Multi-Usuario ✅ IMPLEMENTADO
- **Invitar usuarios** por email ✅
  - Sistema de invitaciones con tokens únicos
  - Notificaciones por email
  - Expiración de invitaciones (7 días)
- **Niveles de permisos**: ✅
  - **Admin**: Gestión completa, invitar usuarios, gestionar colaboradores
  - **Editor**: Crear y enviar mensajes, editar webhook
  - **Viewer**: Solo ver webhooks y historial
- **Gestión de invitaciones**: ✅
  - Ver invitaciones pendientes
  - Aceptar/rechazar invitaciones
  - Cancelar invitaciones enviadas
  - Página dedicada `/invitations` para gestionar invitaciones recibidas
- **Gestión de colaboradores**: ✅
  - Página `/webhooks/{id}/collaborators` para gestionar acceso
  - Cambiar niveles de permisos de colaboradores
  - Remover colaboradores
  - Ver lista de colaboradores actuales y pendientes

### 7. Panel de Control (Dashboard)
- **Estadísticas de uso**:
  - Total de webhooks activos
  - Mensajes enviados (hoy, semana, mes)
  - Envíos programados pendientes
  - Tasa de éxito/error
- **Actividad reciente**
- **Accesos rápidos** a webhooks favoritos
- **Calendario de envíos programados**

### 8. Historial y Logs
- **Registro completo** de todos los envíos
- **Detalles por envío**:
  - Fecha y hora
  - Usuario que lo envió
  - Webhook utilizado
  - Contenido del mensaje
  - Estado (éxito/error)
  - Respuesta de Discord API
- **Filtros y búsqueda** avanzada
- **Exportar historial** a CSV/JSON

### 9. Experiencia de Usuario (UX/UI) ✅ IMPLEMENTADO
- **Sistema de Breadcrumbs** ✅
  - Navegación jerárquica visible en todas las páginas
  - Breadcrumbs clickeables para navegación rápida
  - Contexto visual claro de ubicación en la aplicación
  - Implementado en:
    - Dashboard
    - Webhooks (Index, Create, Edit, Send, History, Collaborators)
    - Quick Send
    - Invitations (Index, Show)
    - Settings (Profile, Password, Appearance, Two-Factor)
- **Navegación del Sidebar Mejorada** ✅
  - Detección inteligente de página activa
  - Solo el item más específico se ilumina (evita iluminación múltiple)
  - Soporte para rutas anidadas
  - Indicadores visuales claros de la página actual
- **Sistema de Notificaciones** ✅
  - Toast notifications modernas y no intrusivas
  - Posicionamiento en esquina superior derecha
  - Animaciones suaves de entrada/salida
  - Auto-cierre configurable (5 segundos por defecto)
  - Cierre manual disponible
  - Soporte para mensajes de éxito y error
  - Integración completa con sistema de flash messages de Laravel
- **Modales de Confirmación** ✅
  - Componente ConfirmDialog reutilizable
  - Reemplazo de alerts nativos del navegador
  - Variantes para acciones destructivas
  - Implementado en eliminación de webhooks, colaboradores e invitaciones
- **Diseño de Cards Compacto** ✅
  - Cards de webhooks y templates con diseño ultra-compacto
  - Tamaños reducidos: avatares 8x8, texto text-sm, iconos 3.5x3.5
  - Badges pequeños: text-[10px], h-5
  - Layout flex con botones siempre en la parte inferior
  - Botón principal con texto + iconos secundarios con tooltips
  - Tooltips informativos en hover (delay 300ms)
  - Espaciado mínimo para máxima densidad de información
- **Sistema de Filtrado y Búsqueda** ✅
  - Búsqueda en tiempo real (frontend)
  - Webhooks: búsqueda por nombre y tags
  - Templates: búsqueda por nombre y categoría
  - Filtros por propiedad (All/My/Shared)
  - Filtros persistentes incluso sin resultados
  - Estados vacíos descriptivos según contexto
- **Funcionalidad de Abandonar Recursos Compartidos** ✅
  - Botón "Leave" para webhooks y templates compartidos
  - Confirmación antes de abandonar
  - Redirección automática tras abandonar
  - Diferenciación visual entre Delete (owner) y Leave (colaborador)
- **Modal "What's New"** ✅
  - Modal automático en dashboard mostrando últimas actualizaciones
  - Lista de novedades con iconos y badges (Nuevo/Mejora)
  - Checkbox "No volver a mostrar" con persistencia en localStorage
  - Versionado para mostrar solo una vez por versión
  - Diseño moderno y atractivo

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

#### Backend
- **Framework**: Laravel (PHP)
- **Base de datos**: PostgreSQL
- **Autenticación**: Laravel Sanctum/Breeze
- **Colas**: Laravel Queue (para envíos programados)
- **Scheduler**: Laravel Task Scheduler (cron jobs)
- **API Externa**: Discord Webhook API

#### Frontend
- **Framework**: Inertia.js (SSR con Laravel)
- **UI Library**: React (con TypeScript)
- **Styling**: Tailwind CSS
- **Componentes**: Headless UI / Radix UI
- **Validación**: Zod / Yup
- **Estado**: React Context / Zustand (si es necesario)

#### Infraestructura
- **Servidor**: Compatible con Laravel (Apache/Nginx)
- **Cache**: Redis (opcional, para mejorar rendimiento)
- **Storage**: Local o S3 para archivos adjuntos
- **Cron**: Sistema de cron para tareas programadas

### Estructura de Base de Datos

#### Tablas Principales

**users**
- id, name, email, password, email_verified_at, timezone, created_at, updated_at

**webhooks**
- id, user_id (owner), name, webhook_url, avatar_url, description, tags (JSON), guild_id, channel_id, created_at, updated_at
- **NOTA**: La columna `is_active` fue eliminada - todos los webhooks están siempre activos

**webhook_collaborators**
- id, webhook_id, user_id, permission_level (admin/editor/viewer), invited_by, invited_at, accepted_at

**templates**
- id, user_id, webhook_id (nullable), name, description, category, content (JSON), is_shared, created_at, updated_at

**scheduled_messages**
- id, webhook_id, user_id, template_id (nullable), message_content (JSON), scheduled_at, recurrence_rule (JSON nullable), status (pending/sent/failed/cancelled), sent_at, error_message, created_at, updated_at

**message_history**
- id, webhook_id, user_id, scheduled_message_id (nullable), message_content (JSON), sent_at, status, response (JSON), created_at

**invitations**
- id, webhook_id, inviter_id, invitee_email, permission_level, token, status (pending/accepted/rejected), expires_at, created_at, updated_at

### APIs y Endpoints Principales

#### Autenticación
- `POST /register` - Registro de usuario
- `POST /login` - Inicio de sesión
- `POST /logout` - Cerrar sesión
- `GET /user` - Obtener usuario actual

#### Webhooks
- `GET /webhooks` - Listar webhooks del usuario
- `POST /webhooks` - Crear webhook
- `GET /webhooks/{id}` - Ver detalles de webhook
- `PUT /webhooks/{id}` - Actualizar webhook
- `DELETE /webhooks/{id}` - Eliminar webhook
- `POST /webhooks/{id}/test` - Enviar mensaje de prueba

#### Mensajes
- `POST /webhooks/{id}/send` - Enviar mensaje inmediato
- `POST /webhooks/{id}/schedule` - Programar mensaje
- `GET /webhooks/{id}/history` - Ver historial de mensajes

#### Plantillas
- `GET /templates` - Listar plantillas
- `POST /templates` - Crear plantilla
- `GET /templates/{id}` - Ver plantilla
- `PUT /templates/{id}` - Actualizar plantilla
- `DELETE /templates/{id}` - Eliminar plantilla

#### Colaboración
- `POST /webhooks/{id}/invite` - Invitar colaborador
- `GET /invitations` - Ver invitaciones del usuario
- `POST /invitations/{token}/accept` - Aceptar invitación
- `POST /invitations/{token}/reject` - Rechazar invitación
- `DELETE /webhooks/{id}/collaborators/{userId}` - Remover colaborador

#### Programación
- `GET /scheduled-messages` - Listar mensajes programados
- `PUT /scheduled-messages/{id}` - Editar mensaje programado
- `DELETE /scheduled-messages/{id}` - Cancelar mensaje programado
- `POST /scheduled-messages/{id}/pause` - Pausar recurrencia
- `POST /scheduled-messages/{id}/resume` - Reanudar recurrencia

---

## 🎨 Diseño y UX

### Principios de Diseño
1. **Interfaz moderna y premium**: Uso de gradientes, glassmorphism, animaciones suaves
2. **Vista previa en tiempo real**: El usuario debe ver exactamente cómo se verá su mensaje en Discord
3. **Flujo intuitivo**: Mínimos clics para realizar acciones comunes
4. **Responsive**: Funcional en desktop, tablet y móvil
5. **Feedback visual**: Confirmaciones, errores y estados de carga claros

### Paleta de Colores
- **Primario**: Tonos de Discord (Blurple #5865F2)
- **Secundario**: Complementarios modernos
- **Modo oscuro**: Por defecto, con opción de modo claro
- **Estados**: Verde (éxito), Rojo (error), Amarillo (advertencia), Azul (info)

### Componentes Clave de UI
- **Editor de mensajes**: Panel dividido con editor a la izquierda y vista previa a la derecha
- **Selector de fecha/hora**: Calendario visual con zona horaria
- **Biblioteca de plantillas**: Grid de tarjetas con vista previa
- **Dashboard**: Widgets con estadísticas y gráficos
- **Gestión de colaboradores**: Tabla con acciones rápidas

---

## 🤖 Directrices para IA (Desarrollo Asistido)

### Contexto para la IA
Cuando la IA trabaje en este proyecto, debe:

1. **Leer este documento primero** para entender el alcance completo
2. **Mantener coherencia** con la arquitectura definida
3. **Seguir las convenciones** de Laravel e Inertia.js
4. **Priorizar la seguridad**: Validación, sanitización, autenticación
5. **Optimizar para rendimiento**: Queries eficientes, caching cuando sea apropiado
6. **Documentar cambios**: Actualizar este documento si se añaden funcionalidades

### Reglas de Implementación
- **Validación en ambos lados**: Frontend (UX) y Backend (seguridad)
- **Manejo de errores robusto**: Try-catch, logs, mensajes de usuario amigables
- **Transacciones de BD**: Para operaciones críticas
- **Rate limiting**: Proteger endpoints de abuso
- **Testing**: Escribir tests para funcionalidades críticas
- **Accesibilidad**: Componentes accesibles (ARIA labels, keyboard navigation)

### Límites de Discord API a Respetar
- Contenido del mensaje: 2000 caracteres
- Embed title: 256 caracteres
- Embed description: 4096 caracteres
- Embed fields: 25 máximo
- Embed field name: 256 caracteres
- Embed field value: 1024 caracteres
- Embed footer: 2048 caracteres
- Embed author name: 256 caracteres
- Total de embeds: 10 por mensaje
- Botones: 5 por fila, 5 filas máximo (25 total)

---

## 🚀 Roadmap de Desarrollo

### Fase 1: MVP (Mínimo Producto Viable)
- [x] Configuración inicial del proyecto (Laravel + Inertia + React)
- [ ] Sistema de autenticación
- [ ] CRUD de webhooks básico
- [ ] Editor de mensajes simple (texto + 1 embed)
- [ ] Envío inmediato de mensajes
- [ ] Dashboard básico

### Fase 2: Funcionalidades Core
- [ ] Editor de mensajes completo (múltiples embeds, botones)
- [ ] Sistema de plantillas
- [ ] Programación de mensajes (únicos)
- [ ] Historial de envíos
- [ ] Validación completa según límites de Discord

### Fase 3: Colaboración
- [ ] Sistema de invitaciones
- [ ] Gestión de permisos
- [ ] Webhooks compartidos
- [ ] Actividad de colaboradores

### Fase 4: Automatización Avanzada
- [ ] Envíos recurrentes
- [ ] Calendario de programación
- [ ] Gestión de cola de envíos
- [ ] Notificaciones de estado

### Fase 5: Mejoras y Optimización
- [ ] Estadísticas avanzadas
- [ ] Exportación de datos
- [ ] Optimización de rendimiento
- [ ] Testing completo
- [ ] Documentación de usuario

### Fase 6: IA (Futuro)
- [ ] Generación de contenido con IA
- [ ] Sugerencias inteligentes de mensajes
- [ ] Análisis de efectividad de mensajes
- [ ] Optimización automática de horarios de envío

---

## 📝 Notas Importantes

### Seguridad
- **Nunca exponer webhook URLs** en logs o respuestas de API sin cifrar
- **Validar permisos** en cada endpoint
- **Sanitizar inputs** para prevenir XSS/SQL injection
- **Rate limiting** en envíos de webhooks
- **Tokens de invitación** con expiración

### Rendimiento
- **Lazy loading** de componentes pesados
- **Paginación** en listados largos
- **Caching** de plantillas frecuentes
- **Queue jobs** para envíos programados
- **Índices de BD** en columnas frecuentemente consultadas

### Mantenibilidad
- **Código limpio** y bien comentado
- **Pruebas unitarias** y de integración
- **Documentación** de API y componentes
- **Versionado semántico**
- **Logs estructurados** para debugging

---

## 📊 Estado de Implementación

### ✅ Completado
1. **Sistema de Autenticación**
   - Login/Registro con Laravel Fortify
   - Gestión de perfiles
   - Verificación de email

2. **Gestión de Webhooks**
   - CRUD completo de webhooks
   - Validación automática con Discord API
   - Auto-rellenado de información desde Discord
   - Detección de duplicados
   - Almacenamiento de metadatos (guild_id, channel_id)
   - Sistema de tags
   - Estados activo/inactivo

3. **Envío de Mensajes**
   - Editor de mensajes con tabs (Content/Embeds)
   - Vista previa en tiempo real estilo Discord
   - Validación contra límites de Discord API
   - Soporte para contenido de texto (máx. 2000 chars)
   - Soporte para embeds (título, descripción, color)
   - Máximo 10 embeds por mensaje
   - Notificaciones de éxito/error

4. **Quick Send (Envío Rápido)**
   - Página dedicada `/send` desde dashboard
   - Dos modos: webhook existente o temporal
   - Selector dropdown para webhooks existentes
   - Webhook temporal con nombre y avatar personalizables
   - Preview del webhook seleccionado
   - Mismo editor de mensajes que envío normal

5. **Historial de Mensajes**
   - Registro completo en base de datos
   - Almacenamiento de payload y respuesta
   - Estado de envío (success/failed)
   - Usuario que envió
   - Fecha y hora
   - Paginación

6. **UI/UX**
   - Dashboard con estadísticas
   - Tarjetas de webhooks con acciones rápidas
   - Botones "Send Message" en lista de webhooks
   - Formularios responsive con layout de 2 columnas
   - Notificaciones visuales con iconos
   - Modo oscuro soportado
   - Diseño consistente en todas las páginas
   - Breadcrumbs de navegación
   - Modales de confirmación en lugar de alerts

7. **Sistema de Colaboración**
   - Invitaciones por email con tokens únicos
   - Gestión de permisos (Admin, Editor, Viewer)
   - Página de invitaciones recibidas
   - Página de gestión de colaboradores por webhook
   - Aceptar/rechazar/cancelar invitaciones
   - Cambiar permisos de colaboradores existentes
   - Remover colaboradores

### 🔄 En Progreso
- Sistema de plantillas reutilizables
- Programación de mensajes
- Botones interactivos (Action Rows)

### 📋 Pendiente
- Organización por categorías/proyectos
- Guardado de borradores
- Integración con IA
- Webhooks programados recurrentes
- Análisis y estadísticas avanzadas
- API REST para integraciones externas
- Notificaciones de actividad de colaboradores
- Logs de auditoría de acciones de colaboradores

---

## 🔄 Actualización de este Documento

**Este documento debe actualizarse cuando**:
- Se añadan nuevas funcionalidades
- Se modifique la arquitectura
- Se cambien decisiones técnicas importantes
- Se descubran nuevos requisitos
- Se complete una fase del roadmap

**Última actualización**: 2025-12-18  
**Versión**: 1.3.0  
**Estado del proyecto**: Desarrollo activo - Sistema de colaboración implementado

---

## 📝 Changelog

### Versión 1.3.0 (2025-12-18)
**Sistema de Colaboración y Mejoras de Consistencia UI**

#### ✨ Nuevas Funcionalidades
- **Sistema de Colaboración Completo**:
  - Invitaciones por email con tokens únicos y expiración
  - Tres niveles de permisos: Admin, Editor, Viewer
  - Página `/invitations` para gestionar invitaciones recibidas
  - Página `/webhooks/{id}/collaborators` para gestionar acceso al webhook
  - Aceptar, rechazar y cancelar invitaciones
  - Cambiar permisos de colaboradores existentes
  - Remover colaboradores con confirmación
  - Notificaciones por email al recibir invitaciones

- **Mejoras de UI/UX**:
  - Diseño consistente en página de invitaciones (layout moderno, breadcrumbs)
  - Diseño consistente en página de colaboradores (layout moderno, breadcrumbs)
  - Modales de confirmación en lugar de alerts nativos
  - Componente ConfirmDialog reutilizable para acciones destructivas

#### 🐛 Correcciones
- **Validación de Webhooks**:
  - Soporte para URLs con dominio `discordapp.com` además de `discord.com`
  - Regex actualizada en `DiscordWebhookService` para ambos dominios
  - Validación de Laravel actualizada para aceptar ambos formatos

- **Sistema de Invitaciones**:
  - Corregido error 500 al cancelar invitaciones
  - Actualizado enum de status en base de datos: `['pending', 'accepted', 'declined', 'cancelled']`
  - Migración creada para actualizar bases de datos existentes
  - Verificación de relación webhook antes de acceder a propiedades

#### 🛠️ Cambios Técnicos
- **Base de Datos**:
  - Migración `2025_12_18_165918_update_invitations_status_enum.php`
  - Actualizado constraint de status en tabla invitations
  - Soporte para estados: pending, accepted, declined, cancelled

- **Controladores**:
  - Mejorado `InvitationController::cancel` con verificaciones de seguridad
  - Actualizado `DiscordWebhookService` para soportar ambos dominios de Discord

### Versión 1.2.0 (2025-12-17)
**Editor de Embeds Completo y Mejoras de UX**

#### ✨ Nuevas Funcionalidades
- **Editor de Embeds Completo**:
  - Soporte para todos los campos de Discord: Title URL, Author, Footer, Timestamp, Image, Thumbnail, Fields
  - Máximo 25 fields por embed con soporte inline
  - Secciones colapsables para mejor organización (Author, Footer, Images)
  - Preview mejorado con posicionamiento correcto de thumbnails
  - Preview sticky que permanece visible al hacer scroll

- **Sistema de Breadcrumbs**:
  - Navegación jerárquica en todas las páginas principales
  - Breadcrumbs clickeables para navegación rápida
  - Implementado en Dashboard, Webhooks, Quick Send y Settings

- **Sistema de Notificaciones Flash**:
  - Toast notifications modernas en esquina superior derecha
  - Mensajes de éxito/error con auto-cierre
  - Integración completa con Inertia.js middleware

#### 🔧 Mejoras
- **Navegación del Sidebar**:
  - Detección inteligente de página activa
  - Solo el item más específico se ilumina (evita iluminación múltiple)
  - Mejor soporte para rutas anidadas

#### 🛠️ Cambios Técnicos
- **Eliminación de `is_active`**:
  - Removida columna `is_active` de la tabla webhooks
  - Todos los webhooks están siempre activos
  - Limpieza de código frontend y backend

- **Middleware de Inertia**:
  - Agregado soporte para flash messages en `HandleInertiaRequests`
  - Compartir automático de mensajes success/error

#### 🐛 Correcciones
- Corregido posicionamiento de thumbnails en preview de embeds
- Corregida detección de página activa en sidebar para rutas anidadas
- Mejorada inferencia de tipos en TypeScript para evitar errores de profundidad

### Versión 1.1.0 (2025-12-16)
**Funcionalidades Básicas Implementadas**
- Sistema de autenticación completo
- CRUD de webhooks con validación Discord API
- Editor básico de mensajes con embeds
- Historial de mensajes enviados
- Quick Send con webhooks temporales

---

## 📚 Referencias

- [Discord Webhook Documentation](https://discord.com/developers/docs/resources/webhook)
- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [Discord Message Components](https://discord.com/developers/docs/interactions/message-components)
- [Discord Embed Limits](https://discord.com/developers/docs/resources/channel#embed-limits)
