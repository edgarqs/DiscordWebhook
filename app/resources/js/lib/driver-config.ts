import { driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';

// Common configuration for all tours
const commonConfig: Config = {
    animate: true,
    showProgress: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Finalizar',
    progressText: '{{current}} de {{total}}',
    popoverClass: 'driver-popover-custom driver-popover-enhanced',
    onDestroyed: () => {
        // Optional: Track tour completion analytics
    },
    onHighlightStarted: (element) => {
        // Add pulse animation to highlighted element
        element?.classList.add('driver-highlight-pulse');
    },
    onDeselected: (element) => {
        // Remove pulse animation
        element?.classList.remove('driver-highlight-pulse');
    },
};

/**
 * Create a driver instance with custom configuration
 */
export function createDriver(config?: Partial<Config>) {
    return driver({
        ...commonConfig,
        ...config,
    });
}

/**
 * Webhook Creation Tour Steps (Adaptive)
 */
export function getWebhookCreationSteps(hasWebhooks: boolean): DriveStep[] {
    const baseSteps: DriveStep[] = [
        {
            element: '[data-driver="webhook-url"]',
            popover: {
                title: '🔗 URL del Webhook',
                description: hasWebhooks
                    ? 'Pega aquí la URL de tu nuevo webhook de Discord. Puedes obtenerla desde: Configuración del Servidor → Integraciones → Webhooks'
                    : '¡Empecemos! Pega aquí la URL de tu primer webhook de Discord. La encontrarás en: Configuración del Servidor → Integraciones → Webhooks',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '[data-driver="fetch-button"]',
            popover: {
                title: '✨ Auto-rellenado Mágico',
                description: '¡Haz clic aquí para validar el webhook y rellenar automáticamente el nombre y avatar desde Discord! Esto te ahorrará tiempo.',
                side: 'left',
                align: 'start',
            },
        },
        {
            element: '[data-driver="webhook-name"]',
            popover: {
                title: '📝 Nombre del Webhook',
                description: hasWebhooks
                    ? 'Dale un nombre descriptivo para identificarlo fácilmente entre tus otros webhooks.'
                    : 'Dale un nombre descriptivo a tu webhook. Si usaste "Fetch from Discord", este campo ya estará rellenado.',
                side: 'bottom',
                align: 'start',
            },
        },
        {
            element: '[data-driver="submit-button"]',
            popover: {
                title: '🚀 Crear Webhook',
                description: hasWebhooks
                    ? '¡Perfecto! Haz clic aquí para añadir este webhook a tu colección.'
                    : '¡Listo! Haz clic aquí para guardar tu primer webhook. Después podrás usarlo para enviar mensajes profesionales a Discord.',
                side: 'top',
                align: 'center',
            },
        },
    ];

    return baseSteps;
}

/**
 * Message Editor Tour Steps
 */
export const messageEditorSteps: DriveStep[] = [
    {
        element: '[data-driver="webhook-selector"]',
        popover: {
            title: '🎯 Selecciona un Webhook',
            description: 'Elige el webhook al que quieres enviar el mensaje. Puedes usar uno existente o una URL temporal.',
            side: 'bottom',
            align: 'start',
        },
    },
    {
        element: '[data-driver="content-tab"]',
        popover: {
            title: '📄 Pestaña de Contenido',
            description: 'Aquí puedes escribir el contenido principal de tu mensaje (hasta 2000 caracteres).',
            side: 'bottom',
            align: 'start',
        },
    },
    {
        element: '[data-driver="message-content"]',
        popover: {
            title: '✍️ Escribe tu Mensaje',
            description: 'Escribe el texto que quieres enviar. Puedes usar menciones como @everyone, @here o @usuario.',
            side: 'left',
            align: 'start',
        },
    },
    {
        element: '[data-driver="embeds-tab"]',
        popover: {
            title: '🎨 Embeds Personalizados',
            description: 'Los embeds te permiten crear mensajes con formato avanzado: títulos, descripciones, colores, imágenes y más. ¡Pruébalos!',
            side: 'bottom',
            align: 'start',
        },
    },
    {
        element: '[data-driver="send-button"]',
        popover: {
            title: '📤 Enviar Mensaje',
            description: '¡Perfecto! Cuando estés listo, haz clic aquí para enviar tu mensaje a Discord.',
            side: 'top',
            align: 'center',
        },
    },
];

/**
 * Dashboard Tour Steps
 */
export const dashboardTourSteps: DriveStep[] = [
    {
        element: '[data-driver="stats-cards"]',
        popover: {
            title: '📊 Estadísticas Rápidas',
            description: 'Aquí puedes ver un resumen de tus webhooks y mensajes enviados. Estas tarjetas se actualizan en tiempo real.',
            side: 'bottom',
            align: 'start',
        },
    },
    {
        element: '[data-driver="new-webhook-button"]',
        popover: {
            title: '➕ Crear Webhook',
            description: 'Haz clic aquí para crear un nuevo webhook rápidamente desde cualquier lugar.',
            side: 'left',
            align: 'start',
        },
    },
    {
        element: '[data-driver="recent-webhooks"]',
        popover: {
            title: '🕐 Webhooks Recientes',
            description: 'Tus webhooks más recientes aparecen aquí. Puedes acceder rápidamente a gestionarlos.',
            side: 'top',
            align: 'start',
        },
    },
    {
        element: '[data-driver="quick-actions"]',
        popover: {
            title: '⚡ Acciones Rápidas',
            description: 'Accesos directos a las funciones más usadas: gestionar webhooks y enviar mensajes rápidos.',
            side: 'top',
            align: 'start',
        },
    },
];

/**
 * Start webhook creation tour (adaptive)
 */
export function startWebhookCreationTour(hasWebhooks: boolean = false) {
    const driverInstance = createDriver({
        onDestroyStarted: () => {
            localStorage.setItem('webhook-creation-tour-completed', 'true');
            driverInstance.destroy();
        },
    });

    driverInstance.setSteps(getWebhookCreationSteps(hasWebhooks));
    driverInstance.drive();
}

/**
 * Start message editor tour
 */
export function startMessageEditorTour() {
    const driverInstance = createDriver({
        onDestroyStarted: () => {
            localStorage.setItem('message-editor-tour-completed', 'true');
            driverInstance.destroy();
        },
    });

    driverInstance.setSteps(messageEditorSteps);
    driverInstance.drive();
}

/**
 * Start dashboard tour (manual trigger only)
 */
export function startDashboardTour() {
    const driverInstance = createDriver({
        onDestroyStarted: () => {
            localStorage.setItem('dashboard-tour-completed', 'true');
            driverInstance.destroy();
            // Dispatch custom event to notify dashboard component
            window.dispatchEvent(new CustomEvent('dashboard-tour-completed'));
        },
    });

    driverInstance.setSteps(dashboardTourSteps);
    driverInstance.drive();
}

/**
 * Check if a tour has been completed
 */
export function isTourCompleted(tourName: 'webhook-creation' | 'message-editor' | 'dashboard'): boolean {
    return localStorage.getItem(`${tourName}-tour-completed`) === 'true';
}

/**
 * Reset tour completion (for testing or manual restart)
 */
export function resetTour(tourName: 'webhook-creation' | 'message-editor' | 'dashboard') {
    localStorage.removeItem(`${tourName}-tour-completed`);
}

/**
 * Reset all tours
 */
export function resetAllTours() {
    resetTour('webhook-creation');
    resetTour('message-editor');
    resetTour('dashboard');
}


