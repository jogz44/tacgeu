import type { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items, collapsed = false }: { items: NavItem[]; collapsed?: boolean }) {
    return (
        <div className="space-y-1">
            {items.map((item, i) => (
                <NavItemWithChildren key={i} item={item} collapsed={collapsed} />
            ))}
        </div>
    );
}

function NavItemWithChildren({ item, collapsed }: { item: NavItem; collapsed?: boolean }) {
    const { url } = usePage();
    const hasChildren = item.children && item.children.length > 0;
    const isActive = hasChildren ? item.children!.some((child) => url.startsWith(child.href ?? '')) : url.startsWith(item.href ?? '');
    const [open, setOpen] = useState(isActive);

    const Badge = ({ count }: { count?: number }) =>
        count && count > 0 ? (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                {count}
            </span>
        ) : null;

    if (!hasChildren) {
        return (
            <Link href={item.href ?? '#'} className="hover:bg-amber-400 flex w-full items-center justify-between px-4 py-2 text-left text-sm">
                <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-5 w-5" />}
                    {!collapsed && <span>{item.title}</span>}
                </div>
                {!collapsed && <Badge count={item.badge} />}
            </Link>
        );
    }

    return (
        <div>
            <button onClick={() => setOpen(!open)} className="hover:bg-amber-400 flex w-full items-center justify-between px-4 py-2 text-left text-sm">
                <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-5 w-5" />}
                    {!collapsed && <span>{item.title}</span>}
                </div>
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <Badge count={item.badge} />
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                )}
            </button>

            {!collapsed && open && (
                <div className="space-y-1 pl-8">
                    {item.children!.map((child, i) => (
                        <Link
                            key={i}
                            href={child.href ?? '#'}
                            className={`hover:bg-amber-400 text-muted-foreground hover:text-foreground flex items-center justify-between px-2 py-1 text-sm ${
                                url.startsWith(child.href ?? '') ? 'text-foreground font-medium' : ''
                            }`}
                        >
                            <span>{child.title}</span>
                            <Badge count={child.badge} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
