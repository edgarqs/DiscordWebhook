import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    badge?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Webhook {
    id: number;
    user_id: number;
    name: string;
    webhook_url: string;
    avatar_url?: string;
    description?: string;
    tags?: string[];
    guild_id?: string;
    channel_id?: string;
    created_at: string;
    updated_at: string;
    message_history_count?: number;
}

export interface MessageHistory {
    id: number;
    webhook_id: number;
    user_id: number;
    message_content: {
        content?: string;
        embeds?: any[];
        components?: any[];
    };
    sent_at: string;
    status: 'success' | 'failed';
    response?: any;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
    };
}
