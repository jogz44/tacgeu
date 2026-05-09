import AuthProfileLayout from '@/layouts/auth/auth-profile-layout';

export default function ProfileLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <AuthProfileLayout title={title} description={description} {...props}>
            {children}
        </AuthProfileLayout>
    );
}
