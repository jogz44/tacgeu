import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password Settings',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { is_first_log } = usePage().props as unknown as { is_first_log: boolean };
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Message`, {
                    description: `Password updated successfully.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2000,
                    position: 'top-right',
                });
                reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Profile settings" />

                <SettingsLayout>
                    <div className="space-y-6 md:max-w-2xl">
                        <HeadingSmall title="Update password" description="Ensure your account is using a long, random password to stay secure" />
                        {is_first_log ? (
                            <div className="rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm">
                                <h2 className="text-sm font-semibold text-red-900">Action required</h2>
                                <p className="text-sm text-red-800">You must update your password before continuing to use the system.</p>
                            </div>
                        ) : ('')}

                        <form onSubmit={updatePassword} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">Current password</Label>
                                <div className="relative">
                                    <Input
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        value={data.current_password}
                                        onChange={(e) => setData('current_password', e.target.value)}
                                        type={showPassword ? 'text' : 'password'}
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        placeholder="Current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">New password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        type={showNewPassword ? 'text' : 'password'}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="New password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">Confirm password</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>


                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button className="bg-green-600 text-white hover:bg-green-800" disabled={processing}>
                                    Save password
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Saved</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </SettingsLayout>
            </AppLayout>
        </>
    );
}
