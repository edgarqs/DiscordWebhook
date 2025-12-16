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
  - Estado activo/inactivo
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
- **Componentes soportados**: ✅ PARCIAL
  - Contenido de texto simple (máx. 2000 caracteres) ✅
  - Embeds personalizables (máx. 10): ✅
    - Título (máx. 256 caracteres) ✅
    - Descripción (máx. 4096 caracteres) ✅
    - Color personalizable ✅
    - Campos (inline y normales) 🔄 PENDIENTE
    - Autor, footer, timestamp 🔄 PENDIENTE
    - Imágenes y thumbnails 🔄 PENDIENTE
    - URLs
  - Botones interactivos (Action Rows): 🔄 PENDIENTE
    - Botones de enlace
    - Botones personalizados
- **Vista previa en tiempo real** estilo Discord ✅
  - Simulación exacta del aspecto en Discord
  - Actualización instantánea al editar
  - Muestra avatar y nombre del webhook
  - Renderizado de embeds con colores
- **Validación en tiempo real** contra límites de Discord API ✅
  - Contador de caracteres en tiempo real
  - Validación de límites (2000 chars contenido, 256 título, 4096 descripción)
  - Máximo 10 embeds por mensaje
  - Mensajes de error descriptivos
- **Notificaciones de envío** ✅
  - Banner de éxito/error visible
  - Auto-desaparece después de 5 segundos
  - Botón para cerrar manualmente
  - Limpieza automática del formulario tras éxito verá el mensaje en Discord

### 4. Sistema de Plantillas
- **Guardar mensajes como plantillas** reutilizables
- **Biblioteca de plantillas** personales
- **Categorización de plantillas** (anuncios, notificaciones, alertas, etc.)
- **Plantillas compartidas** entre colaboradores
- **Variables dinámicas** en plantillas (fecha, hora, nombre de usuario, etc.)
- **Importar/exportar plantillas** en formato JSON

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

### 6. Colaboración Multi-Usuario
- **Invitar usuarios** por email
- **Niveles de permisos**:
  - **Administrador**: Gestión completa, invitar usuarios, eliminar webhooks
  - **Editor**: Crear y enviar mensajes, gestionar plantillas
  - **Visualizador**: Solo ver webhooks y historial
- **Gestión de invitaciones**:
  - Pendientes, aceptadas, rechazadas
  - Revocar acceso
- **Actividad compartida**: Ver quién hizo qué y cuándo

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
- id, user_id (owner), name, webhook_url, avatar_url, description, tags (JSON), is_active, created_at, updated_at

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

### 🔄 En Progreso
- Sistema de plantillas reutilizables
- Programación de mensajes
- Campos de embed adicionales (author, footer, fields, images)
- Botones interactivos (Action Rows)

### 📋 Pendiente
- Sistema de colaboración y permisos
- Organización por categorías/proyectos
- Webhooks compartidos
- Sistema de invitaciones
- Guardado de borradores
- Integración con IA
- Webhooks programados recurrentes
- Análisis y estadísticas avanzadas
- API REST para integraciones externas

---

## 🔄 Actualización de este Documento

**Este documento debe actualizarse cuando**:
- Se añadan nuevas funcionalidades
- Se modifique la arquitectura
- Se cambien decisiones técnicas importantes
- Se descubran nuevos requisitos
- Se complete una fase del roadmap

**Última actualización**: 2025-12-16  
**Versión**: 1.0.0  
**Estado del proyecto**: Planificación inicial

---

## 📚 Referencias

- [Discord Webhook Documentation](https://discord.com/developers/docs/resources/webhook)
- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com/)
- [Discord Message Components](https://discord.com/developers/docs/interactions/message-components)
- [Discord Embed Limits](https://discord.com/developers/docs/resources/channel#embed-limits)
