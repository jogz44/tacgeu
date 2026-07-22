import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notice',
        href: '/tacgeu/notice',
    },
];

const memberSteps = ['Pending', 'Conditional Pre-approved', 'Pre-approved', 'Conditional Approved', 'Approved', 'Active'];
const officerSteps = ['Pending', 'Approved', 'Assigning Role', 'Active'];

export default function Notice() {
    const { user } = usePage().props as any;

    // ✅ Select step list depending on affiliation
    const steps = user?.affiliation === 'Officer' ? officerSteps : memberSteps;

    const currentStatus = user?.status || 'Pending';
    const currentIndex = Math.max(0, steps.indexOf(currentStatus));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notice" />
            <div className="bg-muted flex flex-1 flex-col items-center justify-center space-y-8 px-6 py-16">
                {/* Progress Tracker */}
                <div className="w-full">
                    {currentStatus === 'Rejected' ? (
                        <div className="flex justify-center mt-6">
                            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl shadow-sm border border-red-200 bg-gradient-to-b from-red-50 to-white max-w-xs">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-600 bg-red-600 shadow-md">
                                    <AlertCircle className="h-8 w-8 text-white" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold text-red-700">
                                        Application Rejected
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        Your application has been declined. Please review the details or contact the
                                        administrator to understand the reason for rejection.
                                    </p>
                                </div>

                                {/* <button
                                    onClick={() => alert("Redirect or open details")}
                                    className="text-sm font-medium text-red-700 hover:text-red-900 transition-colors underline"
                                >
                                    View details
                                </button> */}
                            </div>
                        </div>
                    ) : (
                        <div className="relative flex items-center">
                            {/* Steps container */}
                            {steps.map((step, index) => {
                                const isCompleted = index < currentIndex;
                                const isActive = index === currentIndex;

                                return (
                                    <div key={step} className="relative z-20 flex flex-1 flex-col items-center text-center">
                                        <div
                                            className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-300 ${isCompleted
                                                ? 'border-green-600 bg-green-600 text-white'
                                                : isActive
                                                    ? 'border-yellow-400 bg-yellow-400 text-white'
                                                    : 'border-gray-400 bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-white'
                                                }`}
                                        >
                                            {isCompleted ? <CheckCircle className="h-8 w-8" /> : index + 1}
                                        </div>
                                        <span className="mt-2 w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}

                            {/* Progress Bar */}
                            <div
                                className="absolute top-1/3 left-0 h-2 -translate-y-1/2"
                                style={{
                                    left: `calc((100% / ${steps.length}) / 2)`,
                                    width: `calc(100% - (100% / ${steps.length}))`,
                                }}
                            >
                                <div className="h-6 w-full rounded-full bg-gray-300 dark:bg-gray-700" />
                                <div
                                    className="absolute top-0 left-0 h-6 rounded-full bg-green-500 transition-all duration-700"
                                    style={{
                                        width: `${(currentIndex / (steps.length - 1)) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col space-y-4">
                    {/* Remarks */}
                    {user?.remarks && (
                        <div className="relative w-full max-w-3xl rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-6 shadow-md dark:border-yellow-600 dark:bg-gray-800">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                <div className="flex-1 space-y-2">
                                    <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-300">Remarks</h3>
                                    <p className="text-sm leading-relaxed break-words whitespace-pre-line text-yellow-900 dark:text-yellow-200">
                                        {user.remarks}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending / Review Notice */}
                    {currentStatus !== 'Rejected' && currentStatus !== 'Approved' && (
                        <div className="relative w-full max-w-3xl rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-6 shadow-md dark:border-yellow-600 dark:bg-gray-800">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-base font-semibold text-yellow-800 dark:text-yellow-300">
                                        Account Notice — TACGEU
                                    </h3>
                                    <ul className="list-disc space-y-1 pl-5 text-sm text-yellow-800 dark:text-yellow-200">
                                        <li>Your account has been successfully created.</li>
                                        <li>
                                            <strong>Note:</strong> Your application is currently under review. Full access will be granted once
                                            approved.
                                        </li>
                                        {user?.affiliation === 'Member' && (
                                            <li>
                                                Please print and submit the{' '}
                                                <strong>Membership Application Form</strong> to the appropriate department.
                                            </li>
                                        )}
                                        <li>Kindly update your password immediately for security purposes.</li>
                                        <li>Contact our support team if you need assistance.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Approved Notice */}
                    {currentStatus === 'Approved' && (
                        <div className="relative w-full max-w-3xl rounded-xl border-l-4 border-green-500 bg-green-50 p-6 shadow-md dark:border-green-600 dark:bg-gray-800">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="mt-0.5 h-6 w-6 text-green-600 dark:text-green-400" />
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-base font-semibold text-green-800 dark:text-green-300">
                                        {user?.affiliation === 'Member' ? 'Membership Approval' : 'Officer Approval'}
                                    </h3>
                                    {user?.affiliation === 'Member' ? (
                                        <p className="text-sm text-green-800 dark:text-green-200">
                                            Congratulations! Your application has been approved. To become an <strong>active member</strong>, please
                                            proceed with your <strong>Membership Fee</strong> payment to the{' '}
                                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-md font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Treasurer
                                            </span>
                                            .
                                        </p>
                                    ) : (
                                        <p className="text-sm text-green-800 dark:text-green-200">
                                            Congratulations! Your application has been approved. Please wait for the{' '}
                                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-md font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                                                Election Committee
                                            </span>{' '}
                                            or the{' '}
                                            <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-md font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                                                President
                                            </span>{' '}
                                            to assign you an official role within the organization.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
