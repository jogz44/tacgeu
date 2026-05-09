import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import HeadingSmall from '@/components/heading-small';
import { useDropzone } from 'react-dropzone';

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

export default function ReactivateUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data, setData, processing, reset, errors, clearErrors } =
        useForm<Required<{ documents: File | null }>>({
            documents: null,
        });

    const onPdfDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0];
        if (pdfFile && pdfFile.type === 'application/pdf') {
            const uniqueName = `${Date.now()}_${pdfFile.name}`;
            const renamedFile = new File([pdfFile], uniqueName, {
                type: pdfFile.type,
            });
            setData('documents', renamedFile);
        } else {
            alert('Only PDF files are allowed.');
        }
    }, [setData]);

    const {
        getRootProps: getPdfRootProps,
        getInputProps: getPdfInputProps,
        isDragActive: isPdfDragActive,
    } = useDropzone({
        onDrop: onPdfDrop,
        accept: { 'application/pdf': [] },
        maxFiles: 1,
    });

    // Step 1: open confirmation dialog instead of submitting
    const reactivateUser: FormEventHandler = (e) => {
        e.preventDefault();
        setConfirmOpen(true);
    };

    // Step 2: final submit after confirmation
    const submitFinal = () => {
        const formData = new FormData();
        if (data.documents) {
            formData.append('documents', data.documents);
        }

        router.post(route('profile.reactivate'), formData, {
            forceFormData: true,
            onSuccess: () => {
                closeModal();
                toast.success(`Membership Reactivation`, {
                    description: `Your membership reactivation request has been successfully submitted and is subject to prior approval by the Membership Committee.`,
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
                title="Request for Reactivation"
                description="Submit a request to reactivate your membership and regain access to its benefits."
            />

            <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-200/10 dark:bg-blue-700/10">
                <div className="relative space-y-1 text-blue-700 dark:text-blue-100">
                    <h2 className="font-semibold">ℹ️ Notice</h2>
                    <p className="text-sm">
                        Once submitted, your reactivation request will be reviewed by the Membership Committee. You’ll be notified once it’s approved.
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="default"
                            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        >
                            Request Reactivation
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogTitle>Confirm Reactivation Request</DialogTitle>
                        <DialogDescription>
                            Upload your updated PDS. The reactivation process will follow the same procedure as a new application.
                        </DialogDescription>

                        <form className="space-y-6" onSubmit={reactivateUser}>
                            {/* PDF Upload */}
                            <section className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label>Attach PDF File</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Max size: 5MB PDF only.
                                    </p>

                                    <div
                                        {...getPdfRootProps()}
                                        className={`w-full rounded-lg border-2 border-dashed p-6 text-center text-sm transition ${isPdfDragActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        <input {...getPdfInputProps()} />
                                        {isPdfDragActive ? (
                                            <p className="text-blue-500">
                                                Drop your PDF here…
                                            </p>
                                        ) : data.documents ? (
                                            <p className="text-green-600">
                                                {data.documents.name}
                                            </p>
                                        ) : (
                                            <p className="text-gray-500">
                                                Drag & drop or click to select a PDF file
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <InputError message={errors.documents} />
                            </section>

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
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={processing || !data.documents}
                                    type="submit"
                                >
                                    Submit Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ALERT CONFIRMATION */}
                <AlertDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Reactivation Request
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Your request will be submitted for review by the Membership Committee.
                                Are you sure you want to continue?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel>
                                No, go back
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={submitFinal}
                                disabled={processing}
                            >
                                Yes, submit request
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
