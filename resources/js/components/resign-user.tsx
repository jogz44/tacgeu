import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import HeadingSmall from '@/components/heading-small';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { CheckCircle } from 'lucide-react';

export default function ResignUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data, setData, put, processing, reset, errors, clearErrors } =
        useForm<Required<{ password: string; remarks: string }>>({
            password: '',
            remarks: '',
        });

    const resignUser: FormEventHandler = (e) => {
        e.preventDefault();
        setConfirmOpen(true); // open alert dialog instead of submitting immediately
    };

    const submitFinal = () => {
        put(route('profile.resign'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                toast.success(`Membership Withdrawal`, {
                    description:
                        `Your membership withdrawal has been successfully submitted and is subject to prior approval by the Membership Committee.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2000,
                    position: 'top-right',
                });
            },
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
        setConfirmOpen(false);
        setOpen(false);
    };

    return (
        <div className="space-y-6">
            <HeadingSmall
                title="Account Withdrawal"
                description="Withdraw from your membership and all of its benefits"
            />

            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-1 text-red-700 dark:text-red-100">
                    <h2 className="font-semibold">⚠️ Warning</h2>
                    <p className="text-sm">
                        Please proceed with caution — this action cannot be undone.
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="cursor-pointer">
                            Withdraw Membership
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to withdraw your membership?
                        </DialogTitle>
                        <DialogDescription>
                            Once you withdraw, your membership and all related benefits
                            will be permanently terminated. Please enter your password
                            to confirm your withdrawal.
                        </DialogDescription>

                        <form className="space-y-6" onSubmit={resignUser}>
                            {/* Remarks */}
                            <div className="grid gap-2">
                                <Label htmlFor="remarks" className="sr-only">
                                    Remarks
                                </Label>

                                <Textarea
                                    id="remarks"
                                    name="remarks"
                                    value={data.remarks}
                                    onChange={(e) =>
                                        setData('remarks', e.target.value)
                                    }
                                    placeholder="Remarks"
                                    rows={3}
                                />

                                <InputError message={errors.remarks} />
                            </div>

                            {/* Password */}
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Password
                                </Label>

                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            {/* Footer */}
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                    type="submit"
                                    className="cursor-pointer"
                                >
                                    Proceed
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ALERT CONFIRMATION DIALOG */}
                <AlertDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Membership Withdrawal
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is permanent and cannot be undone.
                                Are you absolutely sure you want to continue?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                No, go back
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={submitFinal}
                                disabled={processing}
                            >
                                Yes, withdraw my membership
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
