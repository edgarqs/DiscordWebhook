import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Webhook, Send, Plus, Shield, Mail, FileText, CalendarClock } from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const pendingInvitationsCount = auth?.pendingInvitationsCount || 0;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Webhooks',
            href: '/webhooks',
            icon: Webhook,
        },
        {
            title: 'Quick Send',
            href: '/send',
            icon: Send,
        },
        {
            title: 'Templates',
            href: '/templates',
            icon: FileText,
        },
        {
            title: 'Scheduled Messages',
            href: '/scheduled',
            icon: CalendarClock,
        },
        {
            title: 'Create Webhook',
            href: '/webhooks/create',
            icon: Plus,
        },
    ];

    const dynamicFooterNavItems: NavItem[] = [
        {
            title: 'Invitations',
            href: '/invitations',
            icon: Mail,
            badge: pendingInvitationsCount > 0 ? pendingInvitationsCount.toString() : undefined,
        },
        // Show Admin Panel only for admin users
        ...(user?.role === 'admin' ? [{
            title: 'Admin Panel',
            href: '/admin',
            icon: Shield,
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={dynamicFooterNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
