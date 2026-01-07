export interface ChangelogItem {
    title: string;
    description: string;
}

export interface ChangelogVersion {
    version: string;
    date: string;
    features: ChangelogItem[];
    improvements: ChangelogItem[];
    fixes: ChangelogItem[];
}

export const changelogData: ChangelogVersion[] = [
    {
        version: '1.4.0',
        date: 'Enero 2026',
        features: [
            {
                title: 'Generación con IA',
                description: 'Crea contenido épico para tus mensajes usando Inteligencia Artificial (OpenAI o Google Gemini). Disponible en todos los editores.',
            },
            {
                title: 'Límite de Uso Diario',
                description: 'Sistema de control de costes con límites diarios de uso configurables para usuarios (los admins tienen uso ilimitado).',
            },
            {
                title: 'Diseño Minimalista AI',
                description: 'Botón de IA con estilo ghost premium, degradado animado y bordes refinados para una integración perfecta.',
            },
        ],
        improvements: [
            {
                title: 'Configuración de IA en Admin',
                description: 'Panel completo para elegir proveedor (OpenAI/Gemini), gestionar claves API y configurar límites diarios.',
            },
            {
                title: 'UI sin Interrupciones',
                description: 'Gestión de errores y límites integrada en los diálogos, eliminando alertas emergentes para una experiencia más fluida.',
            },
        ],
        fixes: [
            {
                title: 'Espaciado en Editor',
                description: 'Corregido el espaciado en la página de envío rápido para mantener consistencia visual con el resto de la app.',
            },
        ],
    },
    {
        version: '1.3.0',
        date: 'Enero 2026',
        features: [
            {
                title: 'Soporte de Menciones',
                description: 'Menciona usuarios, roles y @everyone directamente desde el editor de mensajes.',
            },
        ],
        improvements: [
            {
                title: 'Interfaz Global Pulida',
                description: 'Mejoras visuales consistentes en toda la aplicación para una navegación más profesional.',
            },
        ],
        fixes: [],
    },
    {
        version: '1.2.0',
        date: 'Diciembre 2025',
        features: [
            {
                title: 'Mensajes Programados',
                description: 'Sistema completo para programar mensajes one-time o recurrentes (diario, semanal, mensual) con soporte completo de timezone.',
            },
            {
                title: 'Archivos Adjuntos en Programados',
                description: 'Sube imágenes y videos a tus mensajes programados. Los archivos se eliminan automáticamente después de cada envío.',
            },
            {
                title: 'Control de Mensajes Recurrentes',
                description: 'Pausa y reanuda mensajes recurrentes cuando lo necesites. Configura límite máximo de envíos.',
            },
        ],
        improvements: [
            {
                title: 'Diseño Compacto Global',
                description: 'Todas las páginas rediseñadas con un layout más compacto y eficiente, optimizando el espacio en pantalla.',
            },
            {
                title: 'Gestión Automática de Archivos',
                description: 'Sistema de limpieza automática de archivos con observers para prevenir archivos huérfanos.',
            },
        ],
        fixes: [],
    },
    {
        version: '1.1.0',
        date: 'Diciembre 2025',
        features: [
            {
                title: 'Variables Dinámicas',
                description: 'Usa variables como {{date}}, {{time}}, {{username}}, {{random}} en tus templates. Se reemplazan automáticamente al enviar.',
            },
            {
                title: 'Botón Leave para Colaboradores',
                description: 'Los colaboradores ahora pueden abandonar webhooks y templates compartidos fácilmente desde la interfaz.',
            },
            {
                title: 'Sistema de Invitaciones Mejorado',
                description: 'Gestión completa de invitaciones con notificaciones y expiración automática.',
            },
        ],
        improvements: [
            {
                title: 'Cards Compactas',
                description: 'Diseño renovado de las cards de webhooks y templates con mejor aprovechamiento del espacio.',
            },
            {
                title: 'Búsqueda Avanzada',
                description: 'Busca webhooks por nombre y etiquetas (tags) simultáneamente para encontrar lo que necesitas más rápido.',
            },
            {
                title: 'Confirmaciones con Dialogs',
                description: 'Reemplazados los alerts nativos por dialogs personalizados más elegantes y consistentes.',
            },
        ],
        fixes: [],
    },
    {
        version: '1.0.0',
        date: 'Noviembre 2025',
        features: [
            {
                title: 'Gestión de Webhooks',
                description: 'Crea, edita y elimina webhooks de Discord. Organiza con descripciones y tags.',
            },
            {
                title: 'Sistema de Templates',
                description: 'Guarda mensajes como templates reutilizables. Organiza por categorías personalizadas.',
            },
            {
                title: 'Envío Rápido',
                description: 'Interfaz intuitiva para enviar mensajes rápidamente a cualquier webhook.',
            },
            {
                title: 'Embed Builder',
                description: 'Constructor visual completo de embeds con soporte para todos los campos de Discord.',
            },
            {
                title: 'Sistema de Colaboración',
                description: 'Comparte webhooks y templates con otros usuarios. Gestiona permisos y niveles de acceso.',
            },
            {
                title: 'Historial de Mensajes',
                description: 'Registro completo de todos los mensajes enviados con detalles y timestamps.',
            },
        ],
        improvements: [],
        fixes: [],
    },
];
