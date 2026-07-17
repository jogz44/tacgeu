import AppLogoIcon from '@/components/app-logo-icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div
            className="absolute inset-0 bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
            style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.6), rgba(255,255,255,0.6)), url('${window.APP_BASE_URL}assets/images/main.png')",
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
            }}
        >
            <div className="flex w-full max-w-md flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card className="rounded-xl bg-[#FFFCF0]">
                        <CardHeader className="px-10 pb-0 text-center">
                            <Link href={route('home')} className="flex items-center gap-2 self-center font-medium">
                                <div className="flex h-24 w-24 items-center justify-center">
                                    <AppLogoIcon className="size-24 fill-current text-black dark:text-white" />
                                </div>
                            </Link>
                            <CardTitle className="text-xl text-gray-900">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 py-8">{children}</CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
