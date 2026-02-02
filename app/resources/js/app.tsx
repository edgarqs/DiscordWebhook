import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const envAppName = import.meta.env.VITE_APP_NAME;
const appName = (envAppName === 'Laravel' || !envAppName) ? 'Discord Webhook Manager' : envAppName;

// Initialize Matomo Tag Manager
const initializeMatomoTagManager = () => {
    const matomoContainerUrl = import.meta.env.VITE_MATOMO_CONTAINER_URL;

    // Only load Matomo if the container URL is configured
    if (matomoContainerUrl) {
        const _mtm = (window as any)._mtm = (window as any)._mtm || [];
        _mtm.push({ 'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start' });

        const d = document;
        const g = d.createElement('script');
        const s = d.getElementsByTagName('script')[0];

        g.async = true;
        g.src = matomoContainerUrl;

        if (s && s.parentNode) {
            s.parentNode.insertBefore(g, s);
        }
    }
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Initialize Matomo Tag Manager once on app load
initializeMatomoTagManager();
