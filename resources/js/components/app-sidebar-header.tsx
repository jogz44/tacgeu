import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import axios from 'axios';
import { Bell, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserInfo } from '@/components/user-info';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

interface Notification {
    id: number;
    title: string;
    body: string;
    type: string;
    is_read: boolean | string;
    scheduled_at: string;
    published_at: string;
    created_at: string;
}

const badgeColors: Record<string, string> = {
    Announcements: 'bg-indigo-500', // Bold and formal
    Events: 'bg-blue-600', // Inviting and common for public events
    Meetings: 'bg-red-500', // Attention-grabbing, often urgent
    Programs: 'bg-teal-500', // Organized and community-focused
    Contribution: 'bg-emerald-500', // Positive and growth-related
    System: 'bg-orange-400', // Warm and friendly tone for greetings
    Payment: 'bg-green-600', // Trustworthy and money-related
    Election: 'bg-purple-600', // Authoritative and civic-oriented
};

const colorClasses = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
    'bg-gray-500',
    'bg-neutral-500',
];

const getRandomColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorClasses.length;
    return colorClasses[index];
};

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const getInitials = useInitials();
    const { auth } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const isResigned = auth.user.status === 'Resigned' ? true : false;
    const fullName = auth.user ? `${auth.user.given_name} ${auth.user.middle_name ? auth.user.middle_name + ' ' : ''}${auth.user.last_name}` : '';
    const nickName = auth.user.nickname ? `(${auth.user.nickname})` : '';
    const [expandedNotifs, setExpandedNotifs] = useState<Record<number, boolean>>(
        {}
    );

    const CHAR_LIMIT = 60;

    const toggleNotif = (id: number) => {
        setExpandedNotifs((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const isExpanded = (id: number) => expandedNotifs[id];

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('/notification');
                const data = Array.isArray(response.data) ? response.data : [];
                setNotifications(data);
                const unread = data.filter((n) => !Boolean(n.is_read)).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error('Error fetching notifications:', error);
                setNotifications([]);
                setUnreadCount(0);
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    };

    const markAllNotificationsRead = () => {
        axios
            .post('/notification/mark-read')
            .then(() => {
                setUnreadCount(0); // update UI
                setIsDrawerOpen((prev) => !prev); // toggle dropdown
            })
            .catch((err) => console.error(err));
    };

    return (
        <header className="border-sidebar-border/50 relative flex h-16 shrink-0 items-center gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto flex items-center gap-5">
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                        {auth.user.image ? (
                            <AvatarImage
                                src={`/storage/${auth.user.image}`}
                                alt={fullName}
                                className="h-8 w-8 rounded-full object-cover ring-2"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        ) : (
                            <AvatarFallback
                                className={`rounded-lg text-gray-700 ${getRandomColorFromName(fullName)}`}
                            >
                                {getInitials(fullName)}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex flex-col">
                        {isResigned ? (
                            // 🔴 Red badge for deactivated user
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-3 py-1 font-semibold">
                                <span>{fullName}</span>
                                {nickName && <span className="opacity-80">{nickName}</span>}
                            </span>

                        ) : (
                            // 🟢 Normal active name
                            <span className="truncate font-medium text-gray-800 dark:text-white">
                                {fullName} {nickName && `${nickName}`}
                            </span>
                        )}
                    </div>
                </div>


                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative cursor-pointer rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        {unreadCount > 0 ? (
                            // Red badge with number
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white">
                                {unreadCount}
                            </span>
                        ) : (
                            // Small green dot
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500" />
                        )}
                    </button>


                    {/* Notification Dropdown */}
                    {isOpen && (
                        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
                                <span className="text-base font-semibold text-gray-800 dark:text-white">Notifications</span>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => {
                                                    if (notifications.length === 0) {
                                                        alert("No notifications to download.");
                                                        return;
                                                    }

                                                    const logContent = notifications
                                                        .map(
                                                            (n) =>
                                                                `Title: ${n.title}\nType: ${n.type}\nDate: ${formatDate(n.created_at)}\nMessage: ${n.body}\n\n`
                                                        )
                                                        .join("------------------------------------------------------------\n");

                                                    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url;
                                                    a.download = "notification_history.txt";
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Download notification history</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {notifications.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">You're all caught up!</div>
                            ) : (
                                <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
                                    {notifications.map((notif) => (
                                        <li
                                            key={notif.id}
                                            className={`relative flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${notif.is_read ? 'text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'
                                                }`}
                                        >
                                            <div className="flex flex-1 flex-col text-sm leading-snug">
                                                <div className="mt-4 font-semibold">{notif.title}</div>
                                                <div className="mt-4 pl-4 text-sm text-gray-700 dark:text-gray-300">
                                                    {notif.body.length > CHAR_LIMIT && !isExpanded(notif.id)
                                                        ? `${notif.body.slice(0, CHAR_LIMIT)}...`
                                                        : notif.body}

                                                    {notif.body.length > CHAR_LIMIT && (
                                                        <button
                                                            onClick={() => toggleNotif(notif.id)}
                                                            className="ml-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                                        >
                                                            {isExpanded(notif.id) ? "Read less" : "Read more"}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Bottom row: badge at far left, timestamp at far right */}
                                                <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium shadow-sm ${badgeColors[notif.type] || 'bg-gray-400'
                                                            } text-white`}
                                                    >
                                                        {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                                                    </span>
                                                    <span>{notif.created_at ? formatDate(notif.created_at) : ''}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="border-t px-4 py-2 text-center text-sm dark:border-gray-700" onClick={markAllNotificationsRead}>
                                <button className="text-blue-600 hover:underline dark:text-blue-400">View All</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/50" onClick={() => setIsDrawerOpen(false)}></div>

                    {/* Drawer */}
                    <div className="relative h-full w-full max-w-md overflow-y-auto bg-white shadow-lg dark:bg-gray-900">
                        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">All Notifications</h2>
                            <div className="flex items-center gap-2">
                                {/* Download Button with Tooltip */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => {
                                                    if (notifications.length === 0) {
                                                        alert("No notifications to download.");
                                                        return;
                                                    }

                                                    const logContent = notifications
                                                        .map(
                                                            (n) =>
                                                                `Title: ${n.title}\nType: ${n.type}\nDate: ${formatDate(n.created_at)}\nMessage: ${n.body}\n\n`
                                                        )
                                                        .join("------------------------------------------------------------\n");

                                                    const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
                                                    const url = URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url;
                                                    a.download = "notification_history.txt";
                                                    a.click();
                                                    URL.revokeObjectURL(url);
                                                }}
                                                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-white"
                                            >
                                                <Download className="h-5 w-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Download notification history</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/* Close Button with Tooltip */}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                                onClick={() => setIsDrawerOpen(false)}
                                            >
                                                ✕
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Close panel</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {notifications.map((notif) => (
                                <li
                                    key={notif.id}
                                    className="relative flex items-start gap-3 px-4 py-3 font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800"
                                >
                                    <div className="flex flex-1 flex-col text-sm leading-snug">
                                        <div className="mt-4 font-semibold">{notif.title}</div>
                                        <div className="mt-4 pl-4 text-sm text-gray-700 dark:text-gray-300">
                                            {notif.body.length > CHAR_LIMIT && !isExpanded(notif.id)
                                                ? `${notif.body.slice(0, CHAR_LIMIT)}...`
                                                : notif.body}

                                            {notif.body.length > CHAR_LIMIT && (
                                                <button
                                                    onClick={() => toggleNotif(notif.id)}
                                                    className="ml-2 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                                                >
                                                    {isExpanded(notif.id) ? "Read less" : "Read more"}
                                                </button>
                                            )}
                                        </div>
                                        {/* Bottom row: badge at far left, timestamp at far right */}
                                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium shadow-sm ${badgeColors[notif.type] || 'bg-gray-400'
                                                    } text-white`}
                                            >
                                                {notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                                            </span>
                                            <span>{notif.created_at ? formatDate(notif.created_at) : ''}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">End of notifications</div>
                    </div>
                </div>
            )}
        </header>
    );
}
