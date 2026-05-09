import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    useEffect(() => {
        if (status === 'success') {
            setTimeout(() => {
                setShowDialog(true);
            }, 100); // Delay just a bit to ensure DOM is ready
        }
    }, [status]);

    return (
        <>
            <AuthLayout title="Log in to your TACGEU Account" description="Enter your Email and Password below to log in">
                <Head title="Log in" />

                <form className="flex flex-col gap-6" onSubmit={submit}>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-900">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="you@example.com"
                                className="text-gray-900"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password" className="text-gray-900">
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <TextLink href={route('password.request')} className="ml-auto text-sm text-gray-900" tabIndex={5}>
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    className="pr-10 text-gray-900" // add space for icon
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-700 hover:text-gray-900"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onClick={() => setData('remember', !data.remember)}
                                tabIndex={3}
                            />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>

                        <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Log in
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-700">
                        Don't have an account?{' '}
                        <TextLink href={route('membership')} tabIndex={5} className="text-amber-700">
                            Start your Membership.
                        </TextLink>
                    </div>
                </form>
                <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tagum City Government Employees' Union (TACGEU)</AlertDialogTitle>
                            <AlertDialogDescription>
                                Your account has been successfully created. You will receive your login credentials via email shortly.
                                <br />
                                <br />
                                Please be aware that your account is currently under review. Full access to the web application will be granted once
                                your account has been approved.
                                <br />
                                <br />
                                In the meantime, kindly print the Account Activation Form and submit it to the relevant department for further
                                processing.
                                <br />
                                <br />
                                For your security, please log in at your earliest convenience and change your password.
                                <br />
                                <br />
                                If you have any questions or require assistance, please don't hesitate to reach out to our support team.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setShowDialog(false)}>Got it</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AuthLayout>
        </>
    );
}
