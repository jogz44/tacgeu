import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/date';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { ArrowLeft, CheckCircle, CircleX, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members Data Sheet',
        href: '/datasheet',
    },
];

interface User {
    id: number;
    image: string; // changed to string as it looks like a filepath
    last_name: string;
    given_name: string;
    middle_name: string;
    suffix: string;
    nickname: string;
    house_address: string;
    region: string;
    province: string;
    city: string;
    barangay: string;
    contact_number: string;
    email: string;
    birthdate: string;
    birthplace: string;
    sex: string;
    civil_status: string;
    spouse_name: string;
    religion: string;
    education: string;
    college_degree: string;
    postgrad_degree: string;
    position: string;
    salary_grade: string;
    office: string;
    status: string;
    physically_challenged: boolean;
    solo_parent: boolean;
    adoptive_couple: boolean;
    role: string;
    remarks: string;
    documents: string;
}

export default function MemberDetails({ user }: { user: User }) {
    const [isApproving, setIsApproving] = useState(false);
    const [isConPre, setIsConPre] = useState(false);
    const [isConApp, setIsConApp] = useState(false);
    const [isConditional, setIsConditional] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<{ id: number; fullname: string } | null>(null);
    const [showApproveConfirm, setShowApproveConfirm] = useState(false);
    const [approvePayload, setApprovePayload] = useState<{
        id: number;
        fullname: string;
    } | null>(null);
    const { auth } = usePage().props as unknown as {
        auth: {
            user: {
                role: string;
            };
        };
    };

    useEffect(() => {
        setRemarks(user.remarks ?? '');
    }, [user.remarks]);

    function formatDate(date: string | Date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    const approveApplicant = (id: number, fullname: string, remarks: string) => {
        setIsApproving(true);
        router.put(
            `/applicant/${id}`,
            { remarks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Message`, {
                        description: `${fullname} has been successfully Approved.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    });
                    setTimeout(() => {
                        setIsApproving(false);
                        window.history.back();
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    }, 1500);
                },
                onError: (errors) => {
                    toast.error('Failed to update role', {
                        description: errors?.role ?? 'An unexpected error occurred.',
                    });
                    console.error('Failed to update role:', errors);
                },
            },
        );
    };

    const rejectApplicant = (id: number, fullname: string, remarks: string) => {
        setIsRejecting(true);
        let status = 'Reject';
        if (isConPre) {
            status = 'Conditional Pre-approved';
        } else if (isConApp) {
            status = 'Conditional Approved';
        }
        router.put(
            `/applicant/reject/${id}`,
            { remarks, status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Message`, {
                        description: `${fullname} has been Rejected.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    });
                    setTimeout(() => {
                        setIsRejecting(false);
                        window.history.back();
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    }, 1500);
                },
                onError: (errors) => {
                    toast.error(`Error`, {
                        description: `${fullname} An unexpected error occurred..`,
                        icon: <CircleX className="h-5 w-5 text-red-500" />,
                    });
                    console.error('Failed to update role:', errors);
                },
            },
        );
    };

    // Reusable Table Section Component
    const TableSection = ({ title, data }: { title: string; data: { label: string; value: string | React.ReactNode }[] }) => (
        <section>
            <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-100 px-6 py-3 dark:border-gray-700 dark:bg-neutral-800">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h4>
                    </span>
                </div>

                {data.map(({ label, value }) => (
                    <div key={label} className="grid grid-cols-2 border-t border-gray-200 px-6 py-3 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</div>
                        <div className="text-sm text-gray-900 dark:text-white">{value || '—'}</div>
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Member Data Sheet" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-6 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-6 px-6 py-4">
                            <div className="mb-4">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                    onClick={() => window.history.back()}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </div>
                            <Heading
                                title="Members Information"
                                description="View members’ personal details, including their demographic information, educational background, employment history, and membership status within the TACGEU."
                            />
                            {/* Profile Image */}
                            <div className="mb-8 flex justify-center">
                                {user.image ? (
                                    <img
                                        src={`/storage/${user.image}`}
                                        alt="Profile"
                                        className="h-40 w-40 rounded-full object-cover shadow-lg ring-2 ring-indigo-400 transition-transform duration-300 ease-in-out hover:scale-105"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentNode;
                                            if (parent) {
                                                const brokenText = parent.querySelector('.broken-image-text') as HTMLElement | null;
                                                if (brokenText) brokenText.style.display = 'block';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Sections */}
                            <TableSection
                                title="Personal Information"
                                data={[
                                    {
                                        label: 'Full Name',
                                        value: [user.given_name, user.middle_name, user.last_name, user.suffix]
                                            .filter((part) => part && part.trim() !== '')
                                            .join(' '),
                                    },
                                    { label: 'Nickname', value: user.nickname },
                                    {
                                        label: 'Address',
                                        value: `${user.house_address}, ${user.barangay}, ${user.city}, ${user.province}, ${user.region}`,
                                    },
                                    { label: 'Contact Number', value: user.contact_number },
                                    { label: 'Email', value: user.email },
                                ]}
                            />

                            <TableSection
                                title="Demographics"
                                data={[
                                    { label: 'Birthdate', value: formatDate(user.birthdate) },
                                    { label: 'Birthplace', value: user.birthplace },
                                    { label: 'Sex', value: user.sex },
                                    { label: 'Civil Status', value: user.civil_status },
                                    { label: 'Spouse Name', value: user.spouse_name },
                                    { label: 'Religion', value: user.religion },
                                ]}
                            />

                            <TableSection
                                title="Educational Attainment"
                                data={[
                                    { label: 'Education', value: user.education },
                                    { label: 'College Degree', value: user.college_degree },
                                    { label: 'Postgrad Degree', value: user.postgrad_degree },
                                ]}
                            />

                            <TableSection
                                title="Employment Status"
                                data={[
                                    { label: 'Position', value: user.position },
                                    { label: 'Salary Grade', value: user.salary_grade },
                                    { label: 'Office', value: user.office },
                                ]}
                            />

                            <TableSection
                                title="Membership Information"
                                data={[
                                    { label: 'Physically Challenged', value: user.physically_challenged ? 'Yes' : 'No' },
                                    { label: 'Solo Parent', value: user.solo_parent ? 'Yes' : 'No' },
                                    { label: 'Adoptive Couple', value: user.adoptive_couple ? 'Yes' : 'No' },
                                    { label: 'Role', value: user.role },
                                ]}
                            />

                            <section>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                    <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-100 px-6 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Remarks</h4>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 border-t border-gray-200 px-6 py-3 dark:border-gray-700">
                                        <div className="text-sm text-gray-900 dark:text-white">{user.remarks || '—'}</div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                    <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-100 px-6 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Uploaded Documents</h4>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 border-t border-gray-200 px-6 py-3 dark:border-gray-700">
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {user.documents ? (
                                                <a
                                                    href={`/storage/${user.documents}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View Uploaded Supporting Documents
                                                </a>
                                            ) : (
                                                <p className="text-gray-500 dark:text-gray-400">No document uploaded.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <section>
                                <div className="grid grid-cols-1 gap-4 rounded-xl bg-white px-6 py-4 shadow-sm md:grid-cols-3 dark:bg-neutral-900">
                                    {(auth.user.role === 'Membership Committee' && ['Pending', 'Conditional Pre-approved'].includes(user.status)) ||
                                        (auth.user.role === 'President' && ['Pre-approved', 'Conditional Approved'].includes(user.status)) ? (
                                        <>
                                            {/* Pre-approve Button */}
                                            {(user.status === 'Pending' || user.status === 'Conditional Pre-approved') &&
                                                auth.user.role === 'Membership Committee' && (
                                                    <Button
                                                        className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                                        onClick={() => {
                                                            setApprovePayload({
                                                                id: user.id,
                                                                fullname: `${user.given_name} ${user.middle_name ?? ''} ${user.last_name}`.trim(),
                                                            });
                                                            setShowApproveConfirm(true);
                                                        }}
                                                        disabled={isApproving}
                                                    >
                                                        {isApproving ? (
                                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="h-5 w-5" />
                                                        )}
                                                        Pre-approve
                                                    </Button>
                                                )}

                                            {/* Conditional Pre-approve Button */}
                                            {user.status === 'Pending' && auth.user.role === 'Membership Committee' && (
                                                <Button
                                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-700"
                                                    onClick={() => {
                                                        setIsConPre(true);
                                                        setSelectedApplicant({
                                                            id: user.id,
                                                            fullname: `${user.given_name} ${user.middle_name ?? ''} ${user.last_name}`.trim(),
                                                        });
                                                        setShowRejectDialog(true);
                                                    }}
                                                    disabled={isConPre}
                                                >
                                                    {isConPre ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-5 w-5" />
                                                    )}
                                                    Conditional Pre-approve
                                                </Button>
                                            )}

                                            {/* Approve Button */}
                                            {['Pre-approved', 'Conditional Approved'].includes(user.status) && auth.user.role === 'President' && (
                                                <Button
                                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                                    onClick={() => {
                                                        setApprovePayload({
                                                            id: user.id,
                                                            fullname: `${user.given_name} ${user.middle_name ?? ''} ${user.last_name}`.trim(),
                                                        });
                                                        setShowApproveConfirm(true);
                                                    }}
                                                    disabled={isApproving}
                                                >
                                                    {isApproving ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-5 w-5" />
                                                    )}
                                                    Approve
                                                </Button>
                                            )}

                                            {/* Conditional Approve Button */}
                                            {user.status === 'Pre-approved' && auth.user.role === 'President' && (
                                                <Button
                                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-700"
                                                    onClick={() => {
                                                        setIsConApp(true);
                                                        setSelectedApplicant({
                                                            id: user.id,
                                                            fullname: `${user.given_name} ${user.middle_name ?? ''} ${user.last_name}`.trim(),
                                                        });
                                                        setShowRejectDialog(true);
                                                    }}
                                                    disabled={isConApp}
                                                >
                                                    {isConApp ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="h-5 w-5" />
                                                    )}
                                                    Conditional Approve
                                                </Button>
                                            )}

                                            {/* Reject Button (Always visible for these roles and statuses) */}
                                            <Button
                                                className="flex w-full items-center justify-center gap-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                                                onClick={() => {
                                                    setIsConApp(false);
                                                    setIsConPre(false);
                                                    setSelectedApplicant({
                                                        id: user.id,
                                                        fullname: `${user.given_name} ${user.middle_name ?? ''} ${user.last_name}`.trim(),
                                                    });
                                                    setShowRejectDialog(true);
                                                }}
                                            >
                                                <CircleX className="h-5 w-5" />
                                                Reject
                                            </Button>
                                        </>
                                    ) : null}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
                {/* Reject Dialog */}
                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isConPre || isConApp ? 'Submit Application Status' : 'Reject Applicant'}</DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                                {isConPre || isConApp ? (
                                    <>
                                        You are about to mark this applicant as{' '}
                                        <strong>{isConPre ? 'Conditionally Pre-Approved' : 'Conditionally Approved'}</strong>. <br />
                                        Please confirm and provide any necessary remarks.
                                    </>
                                ) : (
                                    <>
                                        You are about to <strong>reject</strong> this applicant's membership request. <br />
                                        Please provide your reason for rejection below.
                                    </>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-2">
                            <Label htmlFor="remarks" className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Remarks/Reasons
                            </Label>
                            <Textarea
                                id="remarks"
                                rows={4}
                                className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="mt-4">
                            <Button
                                className={`cursor-pointer text-white ${isConPre || isConApp ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                onClick={() => {
                                    if (selectedApplicant) {
                                        rejectApplicant(selectedApplicant.id, selectedApplicant.fullname, remarks);
                                    }
                                }}
                                disabled={isRejecting}
                            >
                                {isRejecting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CircleX className="h-5 w-5" />}
                                {isConPre || isConApp ? 'Submit' : 'Reject'}
                            </Button>
                            <Button variant="ghost" onClick={() => setShowRejectDialog(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <AlertDialog
                    open={showApproveConfirm}
                    onOpenChange={setShowApproveConfirm}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Approval
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to approve{' '}
                                <span className="font-semibold">
                                    {approvePayload?.fullname}
                                </span>
                                ?
                                <br />
                                This action will update the applicant’s status.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogAction
                                disabled={isApproving}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                    if (!approvePayload) return;

                                    approveApplicant(
                                        approvePayload.id,
                                        approvePayload.fullname,
                                        remarks
                                    );

                                    setShowApproveConfirm(false);
                                    setApprovePayload(null);
                                }}
                            >
                                {isApproving ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Confirm'
                                )}
                            </AlertDialogAction>
                            <AlertDialogCancel disabled={isApproving}>
                                Cancel
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}
