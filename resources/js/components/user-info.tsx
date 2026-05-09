import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showRole = true }: { user: User; showRole?: boolean }) {
    const getInitials = useInitials();
    const isResigned = user.status === 'Resigned' ? true : false;
    const fullName = user ? `${user.given_name} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name}` : '';
    const nickName = user.nickname ? `(${user.nickname})` : '';
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

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {user.image ? (
                    <AvatarImage
                        src={`/storage/${user.image}`}
                        alt={fullName}
                        className="h-8 w-8 rounded-full object-cover ring-2"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                ) : (
                    <AvatarFallback className={`rounded-lg text-gray-700 ${getRandomColorFromName(fullName)}`}>{getInitials(fullName)}</AvatarFallback>
                )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName} {nickName}</span>
                {isResigned ? (
                    <span className="mt-0.5 inline-block w-fit rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                        Deactivated
                    </span>
                ) : (
                    showRole && (
                        <span className="text-muted-foreground truncate text-xs">
                            {user.role}
                        </span>
                    )
                )}
            </div>
        </>
    );
}
