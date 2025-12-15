# PROJECT ARCHITECTURE - Discord Webhook Manager SaaS

> **FUENTE DE LA VERDAD**: Este documento debe ser consultado y actualizado en cada cambio arquitectónico significativo.

---

## 📋 VISIÓN DEL PROYECTO

Una plataforma SaaS empresarial para la gestión avanzada y automatización de Webhooks de Discord. Permite a equipos y organizaciones:

- **Personalizar mensajes complejos**: Embeds ricos, botones interactivos, avatares personalizados
- **Programar envíos futuros**: Sistema de scheduling con precisión de minutos
- **Colaboración en equipo**: Gestión de organizaciones con múltiples usuarios
- **Reutilización de diseños**: Sistema de templates para mensajes recurrentes
- **Automatización inteligente**: (Futuro) Generación de contenido mediante IA

---

## 🛠️ TECH STACK (ESTRICTO)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript (estricto, sin `any`)
- **Estilos**: Tailwind CSS
- **Componentes**: Shadcn/UI (biblioteca de componentes reutilizables)
- **Estado de Formularios**: React Hook Form
- **Validación**: Zod (validación de esquemas TypeScript-first)

### Backend/BaaS
- **Plataforma**: Supabase
  - **Auth**: Sistema de autenticación (Email + Password)
  - **Database**: PostgreSQL
  - **Realtime**: Subscripciones en tiempo real
  - **Storage**: (Si se requiere para avatares personalizados)
  - **Edge Functions**: Para lógica serverless crítica

### Infraestructura de Scheduling (Background Worker)
- **Background Worker**: Proceso Node.js separado que corre en VPS
  - **node-cron**: Para ejecutar polling cada minuto
  - **Queue System**: Opcional - Bull/BullMQ con Redis para mayor robustez
  - **Process Manager**: PM2 para mantener el worker corriendo 24/7
  - **Funcionalidades**:
    - Polling de tabla `scheduled_events` cada minuto
    - Ejecución de webhooks cuando llega su hora programada
    - Sistema de reintentos automáticos (3 intentos con backoff exponencial)
    - Logging y manejo de errores
    - Health checks y monitoreo

### Deployment & Infrastructure
- **Hosting**: VPS Ubuntu Server
  - **Web Server**: Nginx como reverse proxy
  - **Process Manager**: PM2 para Next.js y Background Worker
  - **Database**: Supabase Cloud (PostgreSQL managed)
  - **Optional**: Redis para queue system (si se usa Bull)

### Herramientas de Desarrollo
- **Package Manager**: pnpm (recomendado por velocidad)
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: (Futuro) Vitest + React Testing Library

---

## 🎯 CORE FEATURES (MVP)

### 1. Sistema de Autenticación
**Prioridad**: ALTA

- **Login Email + Password**: Autenticación tradicional con Supabase Auth
- **Gestión de Sesiones**: JWT tokens manejados por Supabase
- **Perfiles de Usuario**: Avatar, nombre, email
- **Recuperación de Contraseña**: Flow de reset por email

**Consideraciones**:
- Middleware de Next.js para proteger rutas privadas
- Hook personalizado `useAuth()` para acceder al usuario actual
- Validación de contraseña fuerte (mínimo 8 caracteres, números, símbolos)

---

### 2. Sistema de Organizaciones (Teams)
**Prioridad**: ALTA

- **Crear/Unirse a Organizaciones**: Un usuario puede pertenecer a múltiples orgs
- **Roles**: Owner, Admin, Member (preparar arquitectura para permisos granulares)
- **Invitaciones**: Sistema de invites por email
- **Contexto Activo**: UI para cambiar entre organizaciones

**Tabla de Decisiones**:
- Recursos (webhooks, templates) pertenecen a organizaciones, no a usuarios individuales
- RLS debe filtrar por `organization_id` automáticamente

---

### 3. Webhook Manager
**Prioridad**: ALTA

- **CRUD Completo**: Crear, leer, actualizar, eliminar webhooks
- **Validación**: 
  - URL debe ser formato válido de Discord webhook
  - Regex: `^https://discord\.com/api/webhooks/\d+/[\w-]+$`
- **Metadatos**:
  - Nombre amigable
  - Descripción
  - Tags (para organización)
  - Avatar/Username por defecto (override de Discord)
- **Testing**: Botón "Test Webhook" para enviar mensaje de prueba

**Integraciones**:
- Endpoint de Supabase Edge Function para validar que el webhook existe (llamada a Discord API)

---

### 4. Message Builder (Constructor Visual)
**Prioridad**: ALTA

Interfaz **form-based con preview en tiempo real** para construir el JSON complejo de Discord.

**Elementos Soportados (MVP)**:
- **Contenido básico**: 
  - `content` (texto del mensaje)
  - `username` (override)
  - `avatar_url` (override)
- **Embeds**:
  - Title, Description, Color (picker)
  - Fields (name, value, inline)
  - Footer (text, icon_url)
  - Author (name, url, icon_url)
  - Thumbnail, Image
  - Timestamp (toggle)
- **Vista Previa en Tiempo Real**: Mock visual del mensaje renderizado como se vería en Discord
  - Layout de dos columnas: formulario a la izquierda, preview a la derecha
  - Actualización instantánea al editar campos (debounced)
  - Estilos que replican exactamente la UI de Discord

**Validación**:
- Zod schema que refleje las reglas de Discord API
- Límites: 
  - Max 10 embeds por mensaje
  - Max 6000 caracteres totales
  - Max 25 fields por embed

---

### 5. Scheduler (Envíos Programados)
**Prioridad**: ALTA - **BACKGROUND WORKER ES CRÍTICO AQUÍ**

- **UI de Scheduling**:
  - Date/Time picker (considerar timezone del usuario)
  - Opciones: "Enviar ahora", "Programar para...", "Recurrente" (Futuro)
  - Visualización de próximos envíos programados
- **Backend con Background Worker**:
  - Proceso Node.js separado que ejecuta polling cada minuto
  - Query a tabla `scheduled_events` filtrando por `status='pending'` y `scheduled_for <= NOW()`
  - Ejecución de webhook mediante HTTP POST a Discord API
  - Manejo de errores y reintentos (3 intentos con backoff exponencial: 1min, 5min, 15min)
  - Actualización de estado en DB tras cada intento
  - Cancelación de eventos programados (cambio de status a 'cancelled')
- **Estados**:
  - `pending`: Programado pero no ejecutado
  - `sent`: Ejecutado exitosamente
  - `failed`: Falló después de reintentos
  - `cancelled`: Usuario canceló antes de ejecución

**Tabla**: `scheduled_events`

**Arquitectura del Worker**:
```
VPS Ubuntu Server
├── Next.js App (PM2)
│   └── API Routes para CRUD de scheduled_events
└── Background Worker (PM2)
    ├── Cron job cada minuto
    ├── Query a Supabase
    ├── HTTP calls a Discord
    └── Logging a archivo/console
```

---

### 6. Sistema de Templates
**Prioridad**: MEDIA

- **Guardar Diseños**: Convertir un mensaje construido en template reutilizable
- **Categorías**: Personal, Compartido (dentro de organización)
- **Variables**: (Futuro) Placeholders como `{{user.name}}` que se reemplazan dinámicamente

**Tabla**: `templates`

---

## 🗄️ ESQUEMA DE BASE DE DATOS (PRELIMINAR)

### Tablas Principales

```sql
-- USERS (gestionada por Supabase Auth, extendida)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  avatar_url TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORGANIZATIONS
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORGANIZATION MEMBERS (relación muchos-a-muchos)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- WEBHOOKS
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  webhook_url TEXT NOT NULL, -- Discord webhook URL completa
  default_username TEXT,
  default_avatar_url TEXT,
  tags TEXT[], -- Array de tags para filtrado
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEMPLATES
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  message_payload JSONB NOT NULL, -- JSON completo del mensaje Discord
  is_public BOOLEAN DEFAULT FALSE, -- Si es compartido en la org
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SCHEDULED EVENTS (eventos programados)
CREATE TABLE scheduled_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  message_payload JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL, -- IANA timezone del usuario
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ, -- Timestamp del último intento
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para optimizar query del worker
CREATE INDEX idx_scheduled_events_polling 
  ON scheduled_events(status, scheduled_for) 
  WHERE status = 'pending';

-- ACTIVITY LOG (auditoría)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'webhook.created', 'message.sent', etc.
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) - OBLIGATORIO

Todas las tablas deben tener RLS habilitado:

```sql
-- Ejemplo para webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhooks from their organizations"
  ON webhooks FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert webhooks"
  ON webhooks FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );

-- Repetir patrón para UPDATE, DELETE y todas las tablas
```

---

## 🚀 ROADMAP FUTURO (POST-MVP)

### AI Writer (Integración de IA)
**Prioridad**: POST-MVP

- **Provider**: OpenAI GPT-4 o Anthropic Claude
- **Flujo**:
  1. Usuario ingresa prompt: "Genera anuncio de mantenimiento programado para el sábado"
  2. Edge Function de Supabase llama a API de IA
  3. IA retorna JSON estructurado con campos del embed
  4. UI autocompleta el Message Builder
- **Consideraciones**:
  - Sistema de créditos o límites por organización
  - Prompts optimizados para generar JSON válido de Discord
  - Cache de respuestas comunes

### Recurrencia de Mensajes
- Cron-like scheduling: "Todos los lunes a las 9:00"
- Tabla adicional `recurring_schedules` con reglas CRON
- Worker genera nuevos `scheduled_events` basados en las reglas

### Analytics Dashboard
- Métricas: Webhooks enviados, tasa de éxito, horarios pico
- Integración con Discord API para ver engagement (si es bot propio)

### Marketplace de Templates
- Templates públicos compartidos entre organizaciones
- Sistema de "likes" y categorización

---

## 📐 DIRECTRICES DE DESARROLLO

### TypeScript Estricto
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Arquitectura de Componentes
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Colocation**: Colocar archivos relacionados juntos (componente + test + estilos)
- **Naming**: PascalCase para componentes, kebab-case para archivos

Ejemplo de estructura:
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupo de rutas de autenticación
│   ├── (dashboard)/       # Grupo de rutas privadas
│   └── api/               # API routes
├── components/
│   ├── ui/                # Shadcn components
│   ├── forms/             # Form components
│   ├── layouts/           # Layout components
│   ├── preview/           # Discord message preview components
│   └── features/          # Feature-specific components
├── lib/
│   ├── supabase/          # Supabase client & queries
│   ├── discord/           # Discord API helpers
│   ├── validations/       # Zod schemas
│   └── utils/             # Utilidades generales
├── types/                 # TypeScript types globales
└── worker/                # Background Worker (proceso separado)
    ├── index.ts           # Entry point del worker
    ├── scheduler.ts       # Lógica de scheduling
    ├── webhook-sender.ts  # Envío de webhooks
    └── retry-handler.ts   # Lógica de reintentos
```

### Mobile-First Design
- Todos los diseños deben funcionar en mobile (320px+) primero
- Usar breakpoints de Tailwind: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly: Botones mínimo 44x44px

### Validación con Zod
Ejemplo de schema para webhook:
```typescript
import { z } from 'zod';

export const webhookSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  webhook_url: z.string()
    .url()
    .regex(
      /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/,
      "Must be a valid Discord webhook URL"
    ),
  default_username: z.string().max(80).optional(),
  default_avatar_url: z.string().url().optional(),
  tags: z.array(z.string()).max(10).optional(),
});
```

### Manejo de Errores
- Usar Error Boundaries en React para errores de UI
- Toast notifications para feedback de usuario (Shadcn Toast)
- Logging estructurado en Edge Functions

### Performance
- **Code Splitting**: Lazy loading de componentes pesados
- **Image Optimization**: Usar `next/image`
- **Caching**: React Server Components para contenido estático
- **Database**: Índices en columnas frecuentes (organization_id, user_id)

---

## 🔐 SEGURIDAD

### Principios
1. **Nunca exponer secrets en frontend**: Usar variables de entorno server-side
2. **Validar siempre en backend**: No confiar en validación del cliente
3. **RLS en todas las tablas**: Supabase debe ser la única fuente de verdad
4. **Rate Limiting**: Implementar en API routes críticas
5. **Sanitización**: Escapar HTML en mensajes de usuario

### Variables de Entorno
```env
# Public (pueden estar en cliente)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Private (solo servidor y worker)
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=                    # Para worker (conexión directa a Supabase)

# Worker configuration
WORKER_POLL_INTERVAL_MS=60000    # Polling cada 60 segundos
WORKER_MAX_RETRIES=3
WORKER_RETRY_DELAYS=60000,300000,900000  # 1min, 5min, 15min

# Optional: Redis para queue
REDIS_URL=
```

---

## ✅ CHECKLIST DE INICIO

Antes de escribir código funcional:
- [x] Crear PROJECT_ARCHITECTURE.md
- [ ] Inicializar proyecto Next.js 14+
- [ ] Configurar Supabase (proyecto + DB)
- [ ] Instalar Shadcn/UI base
- [ ] Configurar TypeScript estricto
- [ ] Crear esquema de DB inicial
- [ ] Habilitar RLS en todas las tablas
- [ ] Configurar autenticación de Supabase (Email + Password)
- [ ] Crear estructura del Background Worker
- [ ] Configurar PM2 para desarrollo local

---

## 📝 LOG DE CAMBIOS

| Fecha | Cambio | Razón |
|-------|--------|-------|
| 2025-12-15 | Documento inicial creado | Establecer arquitectura base |
| 2025-12-15 | Eliminado login social (Discord/Google) | Solo autenticación por email |
| 2025-12-15 | Reemplazado Inngest por Background Worker interno | Eliminar dependencias externas, control total en VPS |
| 2025-12-15 | Especificado Email + Password para auth | Método tradicional más familiar |
| 2025-12-15 | Definido Message Builder con preview en tiempo real | Mejor UX para construir mensajes complejos |
| 2025-12-15 | Deployment target: VPS Ubuntu + PM2 | Hosting propio en servidor del usuario |

---

**COMPROMISO**: Este archivo se actualizará cada vez que:
1. Se agregue una nueva feature mayor
2. Se cambie el tech stack
3. Se modifique el esquema de base de datos
4. Se tomen decisiones arquitectónicas importantes

**ÚLTIMA ACTUALIZACIÓN**: 2025-12-15 20:24
