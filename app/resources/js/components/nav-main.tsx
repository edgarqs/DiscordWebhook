import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // Function to determine if a nav item is active
    const isItemActive = (itemHref: NonNullable<NavItem['href']>) => {
        const currentUrl = page.url;
        const resolvedHref = resolveUrl(itemHref);

        // Exact match
        if (currentUrl === resolvedHref) {
            return true;
        }

        // For parent routes, only mark as active if there's no more specific match
        // Check if current URL starts with this href
        if (currentUrl.startsWith(resolvedHref)) {
            // Check if any other item has a more specific match
            const hasMoreSpecificMatch = items.some(otherItem => {
                const otherHref = resolveUrl(otherItem.href);
                return otherHref !== resolvedHref &&
                    otherHref.startsWith(resolvedHref) &&
                    currentUrl.startsWith(otherHref);
            });

            return !hasMoreSpecificMatch;
        }

        return false;
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isItemActive(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                                {item.badge && (
                                    <Badge
                                        variant="destructive"
                                        className="ml-auto h-5 w-5 shrink-0 items-center justify-center rounded-full p-0 text-xs"
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
