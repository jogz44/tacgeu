import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import AppLayout from '@/layouts/app-layout';
import { Candidate, Election, Position, User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, CircleCheck, CircleX, Hourglass, LoaderCircle, Pencil, Trash2, UserPlus, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Candidates',
        href: '/candidates',
    },
];

export default function candidates() {
    const positions = (usePage().props.positions as Position[]) || [];
    const elections = (usePage().props.elections as Election[]) || [];
    const users: User[] = (usePage().props.users as User[]) || [];
    const { auth } = usePage().props as any;
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [open, setOpen] = useState(false);
    const [open1, setOpen1] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('All');
    const [selectedElection, setSelectedElection] = useState<string>('');
    const [confirmCandidateOpen, setConfirmCandidateOpen] = useState(false);
    const [confirmApplyOpen, setConfirmApplyOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        user_id: '',
        election_id: '',
        position_id: '',
    });
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusAction, setStatusAction] = useState<{ candidate: any; status: string } | null>(null);
    const debouncedSearch = useDebounce(userSearch, 500);

    const filteredPositions = positions.filter((p) => p.election.id && p.election.id === Number(data.election_id));
    const ringColors = ['ring-red-500', 'ring-green-500', 'ring-blue-500', 'ring-yellow-400', 'ring-purple-600', 'ring-pink-500', 'ring-indigo-400'];
    const getRingColor = (id: number | string) => {
        const hash = typeof id === 'string' ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : id;
        return ringColors[hash % ringColors.length];
    };

    useEffect(() => {
        if (Array.isArray(elections) && elections.length > 0) {
            setSelectedElection(String(elections[0].id));
            setData('election_id', String(elections[0].id));
            fetchCandidate(String(elections[0].id));
        }
    }, [elections]);

    useEffect(() => {
        if (selectedElection) {
            fetchCandidate(selectedElection);
        }
    }, [selectedElection]);

    useEffect(() => {
        if (auth?.user?.id && auth?.user?.role === 'Member') {
            setData('user_id', auth.user.id);
        }
    }, [auth?.user, setData]);

    const fetchCandidate = async (election_id = '', search = '', status = '') => {
        try {
            const query = new URLSearchParams({
                election_id,
                search,
                status,
            }).toString();
            const response = await fetch(`/candidates/list?${query}`);
            const data = await response.json();

            if (response.ok) {
                setCandidates(data.candidates);
            } else {
                console.error('Error fetching candidates:', data);
            }
        } catch (error) {
            console.error('Error fetching candidates:', error);
        }
    };

    useEffect(() => {
        fetchCandidate(selectedElection, debouncedSearch, selectedStatus);
    }, [selectedElection, debouncedSearch, selectedStatus]);

    const handleSaveCandidate = () => {
        post(route('candidates.store'), {
            onSuccess: () => {
                setOpen(false);
                toast.success(`Message`, {
                    description: `New election candidate has been recorded.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 3500,
                });
                reset();
                setUserSearch('');
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat().join('\n');

                toast.error(`Error`, {
                    description: messages || 'An error occurred.',
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 5000,
                });
                console.error('Failed to add new candidate:', errors);
            },
        });
    };

    const setApplyCandidacyOpen = () => {
        post(route('candidates.store'), {
            onSuccess: (response) => {
                setOpen1(false);
                toast.success(`Message`, {
                    description: `New election candidate has been recorded.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 3500,
                });
                console.log(response);
                reset(); // Clear form
                setUserSearch('');
            },
            onError: (errors) => {
                const messages = Object.values(errors).flat().join('\n');

                toast.error(`Error`, {
                    description: messages || 'An error occurred.',
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 5000,
                });
                console.error('Failed to add new candidate:', errors);
            },
        });
    };
    const handleDelete = () => {
        if (!selectedCandidate?.id || !selectedElection) return;

        setIsDeleting(true);

        router.delete(
            route('candidates.destroy', {
                election: selectedElection,
                id: selectedCandidate.id,
            }),
            {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    toast.success('Message', {
                        description: 'The candidate has been successfully deleted.',
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 3500,
                    });
                    setIsDeleting(false);
                    setSelectedCandidate(null);
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0];
                    toast.error('Error', {
                        description: firstError,
                        icon: <CircleX className="h-5 w-5 text-red-500" />,
                        duration: 3500,
                    });
                    setIsDeleting(false);
                },
            },
        );
    };

    // inside your component
    const handleStatusChange = (newStatus: string) => {
        try {
            if (!selectedCandidate?.id) return;
            router.put(
                route('candidates.updateStatus'),
                {
                    candidate_id: selectedCandidate.id,
                    election_id: selectedElection,
                    status: newStatus,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Message`, {
                            description: `Candidate status updated`,
                            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                            duration: 3500,
                        });
                        console.log('Candidate status updated!');
                    },
                    onError: (errors) => {
                        // Collect error messages (support arrays or strings)
                        const messages = Object.values(errors).flat().join('\n');

                        toast.error(`Error`, {
                            description: messages || 'An error occurred.',
                            icon: <CircleX className="h-5 w-5 text-red-500" />,
                            duration: 5000,
                        });
                        console.error('Failed to update candidate status', errors);
                    },
                },
            );
        } catch (error) {
            toast.error(`Error`, {
                description:
                    typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : 'An error occurred',
                icon: <CircleX className="h-5 w-5 text-red-500" />,
                duration: 3500,
            });
            console.error('Failed to update candidate status', error);
        }
    };

    const formatDateRange = (startDate: Date, endDate: Date) => {
        const startStr = startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
        const endStr = endDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });

        return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Candidates" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title="TACGEU Election Candidates" description="Records of all election candidates incurred by the TACGEU." />
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                {/* Left side: Election + Search */}
                                <div className="flex w-full flex-col gap-2 md:max-w-sm">
                                    {/* Election dropdown */}
                                    <Select onValueChange={(value) => setSelectedElection(value)} value={selectedElection}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Filter by Election" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60 overflow-y-auto">
                                            {elections.map((election) => (
                                                <SelectItem key={election.id} value={String(election.id)}>
                                                    {election.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                {/* Right side: Status + Button */}
                                <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-4">
                                    {/* Search Input */}
                                    <Input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    />
                                    {/* Status Select */}
                                    <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value)}>
                                        <SelectTrigger className="w-full md:w-48">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60 overflow-y-auto">
                                            <SelectItem value="All">All</SelectItem>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Action Button */}
                                    {(auth?.user?.role === 'Election Committee' || auth?.user?.role === 'Member') &&
                                        (() => {
                                            // find selected election
                                            const selected = elections.find((e) => String(e.id) === selectedElection);

                                            // get today's date
                                            const today = new Date();

                                            // check if filing period is still open
                                            const filingEnd = selected ? new Date(selected.filing_end_date) : null;
                                            // Strip time so we only compare dates
                                            const stripTime = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                            const todayDate = stripTime(today);
                                            const filingEndDate = filingEnd ? stripTime(filingEnd) : null;

                                            // ✅ Compare Date objects (not strings)
                                            const isFilingOpen = filingEndDate && todayDate <= filingEndDate;

                                            // Only show button if within filing period
                                            if (!isFilingOpen) {
                                                return (
                                                    <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-center text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
                                                        ⚠️ Filing period has ended. You can no longer apply for candidacy.
                                                    </p>
                                                );
                                            }

                                            // Otherwise show the button
                                            return (
                                                <Button
                                                    className="flex w-full items-center gap-2 rounded-md bg-green-600 text-white transition-colors hover:bg-green-700 md:w-auto"
                                                    onClick={() => {
                                                        if (auth?.user?.role === 'Election Committee') {
                                                            reset();
                                                            setUserSearch('');
                                                            setSelectedCandidate(null);
                                                            setIsEditing(false);
                                                            setOpen(true);
                                                        } else {
                                                            setOpen1(true);
                                                        }
                                                    }}
                                                >
                                                    <UserPlus className="mr-2" />
                                                    {auth?.user?.role === 'Election Committee' ? 'New Candidate' : 'Apply for Candidacy'}
                                                </Button>
                                            );
                                        })()}
                                </div>
                            </div>

                            {/* <div className="space-y-2">
                                {elections
                                    .filter((e) => String(e.id) === selectedElection)
                                    .map((election) => {
                                        const filingStart = new Date(election.filing_start_date);
                                        const filingEnd = new Date(election.filing_end_date);
                                        const start = new Date(election.start_date);
                                        const end = new Date(election.end_date);
                                        const today = new Date();

                                        const stripTime = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                        const todayDate = stripTime(today);
                                        const filingStartDate = stripTime(filingStart);
                                        const filingEndDate = stripTime(filingEnd);
                                        const startDate = stripTime(start);
                                        const endDate = stripTime(end);


                                        const filingTotal = filingEndDate.getTime() - filingStartDate.getTime();
                                        let filingWidth = ((todayDate.getTime() - filingStartDate.getTime()) / filingTotal) * 100;
                                        if (todayDate > filingEndDate) filingWidth = 100;
                                        if (filingWidth < 0) filingWidth = 0;

                                        const electionTotal = endDate.getTime() - startDate.getTime();
                                        let electionWidth = ((todayDate.getTime() - startDate.getTime()) / electionTotal) * 100;
                                        if (todayDate > endDate) electionWidth = 100;
                                        if (electionWidth < 0) electionWidth = 0;

                                        return (
                                            <div
                                                key={election.id}
                                                className="rounded-2xl border border-gray-200 bg-white py-4 px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <h3 className="mb-2 text-base font-semibold text-gray-700 dark:text-gray-200">
                                                    {election.title} – Timeline
                                                </h3>

                                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                    <div>
                                                        <div className="mb-1 flex justify-between text-xs text-gray-500">
                                                            <span>Filing Period</span>
                                                            <span>{formatDateRange(filingStart, filingEnd)}</span>
                                                        </div>
                                                        <div className="relative h-6 w-full rounded bg-gray-200 dark:bg-gray-700">
                                                            <div
                                                                className="absolute h-6 rounded"
                                                                style={{
                                                                    width: `${filingWidth}%`,
                                                                    backgroundColor: filingWidth === 100 ? "#ef4444" : "#3b82f6",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="mb-1 flex justify-between text-xs text-gray-500">
                                                            <span>Election Period</span>
                                                            <span>{formatDateRange(start, end)}</span>
                                                        </div>
                                                        <div className="relative h-6 w-full rounded bg-gray-200 dark:bg-gray-700">
                                                            <div
                                                                className="absolute h-6 rounded"
                                                                style={{
                                                                    width: `${electionWidth}%`,
                                                                    backgroundColor: electionWidth === 100 ? "#ef4444" : "#22c55e",
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div> */}
                            <div className="space-y-4">
                                {elections
                                    .filter((e) => String(e.id) === selectedElection)
                                    .map((election) => {
                                        const filingStart = new Date(election.filing_start_date);
                                        const filingEnd = new Date(election.filing_end_date);
                                        const start = new Date(election.start_date);
                                        const end = new Date(election.end_date);

                                        return (
                                            <div
                                                key={election.id}
                                                className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <h3 className="mb-3 text-lg font-bold text-gray-700 transition-colors duration-200 group-hover:text-blue-500 dark:text-gray-200">
                                                    {election.title}
                                                </h3>

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {/* Filing Period */}
                                                    <div className="rounded-lg bg-gray-50 p-4 transition-colors duration-200 group-hover:bg-blue-50 dark:bg-gray-700 dark:group-hover:bg-blue-900">
                                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Filing Period</p>
                                                        <p className="mt-1 text-gray-700 dark:text-gray-200">
                                                            {formatDateRange(filingStart, filingEnd)}
                                                        </p>
                                                    </div>

                                                    {/* Election Period */}
                                                    <div className="rounded-lg bg-gray-50 p-4 transition-colors duration-200 group-hover:bg-green-50 dark:bg-gray-700 dark:group-hover:bg-green-900">
                                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Election Period</p>
                                                        <p className="mt-1 text-gray-700 dark:text-gray-200">{formatDateRange(start, end)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>

                            <div className="mt-2 space-y-10">
                                <div className="mt-2">
                                    <Table className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
                                        <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                            <TableRow>
                                                <TableHead className="text-center text-sm tracking-wider break-words whitespace-normal text-white">
                                                    Candidate
                                                </TableHead>
                                                <TableHead className="text-sm font-medium tracking-wider break-words whitespace-normal text-white">
                                                    Candidacy
                                                </TableHead>
                                                <TableHead className="text-sm font-medium tracking-wider break-words whitespace-normal text-white">
                                                    Status
                                                </TableHead>
                                                {auth?.user?.role === 'Election Committee' && (
                                                    <TableHead className="text-center text-sm tracking-wider text-white">Actions</TableHead>
                                                )}
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="bg-white dark:bg-gray-900">
                                            {candidates.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={auth?.user?.role === 'Election Committee' ? 4 : 3}
                                                        className="py-6 text-center text-gray-500 dark:text-gray-400"
                                                    >
                                                        No candidates found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                candidates.map((candidate, index) => (
                                                    <TableRow key={`${index}`} className="transition hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        <TableCell className="text-center align-middle">
                                                            <div className="flex w-full items-center p-2 dark:border-gray-700 dark:bg-gray-900">
                                                                {/* Profile Image */}
                                                                {candidate.image ? (
                                                                    <img
                                                                        src={`/storage/${candidate.image}`}
                                                                        alt={`${candidate.given_name} ${candidate.last_name}`}
                                                                        className={`${getRingColor(candidate.id)} h-12 w-12 rounded-full object-cover ring-2`}
                                                                        onError={(e) => {
                                                                            e.currentTarget.onerror = null;
                                                                            e.currentTarget.style.display = 'none';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-500">
                                                                        No Image
                                                                    </div>
                                                                )}

                                                                {/* Candidate Info */}
                                                                <div className="flex-1 space-y-1">
                                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                                        {candidate.last_name} {candidate.given_name} {candidate.middle_name}
                                                                    </h3>

                                                                    {/* {candidate.position && (
                                                                        <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                                                            {candidate.position}
                                                                        </p>
                                                                    )} */}

                                                                    {candidate.office && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.office}</p>
                                                                    )}

                                                                    {candidate.education && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            Education: {candidate.education}
                                                                        </p>
                                                                    )}

                                                                    {candidate.college_degree && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            College Degree: {candidate.college_degree}
                                                                        </p>
                                                                    )}

                                                                    {candidate.postgrad_degree && (
                                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                            Postgrad Degree: {candidate.postgrad_degree}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-sm text-gray-800 dark:text-white">
                                                            {candidate.candidacy || '—'}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {candidate.status ? (
                                                                <span
                                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium shadow-sm ${
                                                                        candidate.status === 'Approved'
                                                                            ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                                                                            : candidate.status === 'Rejected'
                                                                              ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200'
                                                                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                                    }`}
                                                                >
                                                                    {candidate.status === 'Approved' && <CheckCircle className="h-3.5 w-3.5" />}
                                                                    {candidate.status === 'Rejected' && <XCircle className="h-3.5 w-3.5" />}
                                                                    {candidate.status !== 'Approved' && candidate.status !== 'Rejected' && (
                                                                        <Hourglass className="h-3.5 w-3.5" />
                                                                    )}
                                                                    {candidate.status}
                                                                </span>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </TableCell>
                                                        {/* --- Committee Action Buttons --- */}
                                                        {auth?.user?.role === 'Election Committee' &&
                                                            (() => {
                                                                const selected = elections.find((e) => String(e.id) === selectedElection);
                                                                const today = new Date();
                                                                const filingEnd = selected ? new Date(selected.filing_end_date) : null;
                                                                const stripTime = (date: Date) =>
                                                                    new Date(date.getFullYear(), date.getMonth(), date.getDate());
                                                                const todayDate = stripTime(today);
                                                                const filingEndDate = filingEnd ? stripTime(filingEnd) : null;
                                                                const isFilingOpen = filingEndDate && todayDate <= filingEndDate;

                                                                // Hide all buttons after filing period ends
                                                                if (!isFilingOpen) {
                                                                    return (
                                                                        <TableCell className="text-center text-xs text-gray-400 italic">
                                                                            Filing period closed
                                                                        </TableCell>
                                                                    );
                                                                }

                                                                return (
                                                                    <TableCell>
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            {/* Approve / Reject */}
                                                                            {candidate.status === 'Pending' && (
                                                                                <>
                                                                                    <TooltipProvider>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    variant="default"
                                                                                                    size="icon"
                                                                                                    onClick={() => {
                                                                                                        setSelectedCandidate(candidate);
                                                                                                        setStatusAction({
                                                                                                            candidate,
                                                                                                            status: 'Approved',
                                                                                                        });
                                                                                                        setShowStatusModal(true);
                                                                                                    }}
                                                                                                    className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                                                                                                >
                                                                                                    <CircleCheck className="h-4 w-4 text-white" />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p>Approve Candidate</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </TooltipProvider>

                                                                                    <TooltipProvider>
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Button
                                                                                                    variant="destructive"
                                                                                                    size="icon"
                                                                                                    onClick={() => {
                                                                                                        setSelectedCandidate(candidate);
                                                                                                        setStatusAction({
                                                                                                            candidate,
                                                                                                            status: 'Rejected',
                                                                                                        });
                                                                                                        setShowStatusModal(true);
                                                                                                    }}
                                                                                                    className="cursor-pointer"
                                                                                                >
                                                                                                    <CircleX className="h-4 w-4 text-white" />
                                                                                                </Button>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p>Reject Candidate</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </TooltipProvider>
                                                                                </>
                                                                            )}

                                                                            {/* Update Candidate */}
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="icon"
                                                                                            onClick={() => {
                                                                                                setIsEditing(true);
                                                                                                setData({
                                                                                                    user_id: String(candidate.user_id),
                                                                                                    election_id: selectedElection,
                                                                                                    position_id: candidate.position_id,
                                                                                                });
                                                                                                setSelectedCandidate(candidate);
                                                                                                setOpen(true);
                                                                                            }}
                                                                                            className="cursor-pointer text-blue-500 hover:bg-blue-500 hover:text-white"
                                                                                        >
                                                                                            <Pencil className="h-4 w-4" />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>Update Candidate</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>

                                                                            {/* Remove Candidate */}
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="icon"
                                                                                            onClick={() => {
                                                                                                setSelectedCandidate(candidate);
                                                                                                setShowDeleteModal(true);
                                                                                            }}
                                                                                            className="cursor-pointer text-red-500 hover:bg-red-500 hover:text-white"
                                                                                        >
                                                                                            <Trash2 className="h-4 w-4" />
                                                                                        </Button>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        <p>Remove Candidate</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        </div>
                                                                    </TableCell>
                                                                );
                                                            })()}
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Election Candidate' : 'Add New Election Candidate'}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? 'Update the details of the election candidate.' : 'Enter details about this election candidate.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Election Dropdown */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Election</Label>
                                <Select value={data.election_id} onValueChange={(value) => setData('election_id', value)}>
                                    <SelectTrigger id="election" className="w-full">
                                        <SelectValue placeholder="Choose an election" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {elections.map((election) => (
                                            <SelectItem key={election.id} value={String(election.id)}>
                                                {election.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative flex flex-col gap-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Candidate</Label>
                                <Input
                                    required
                                    type="text"
                                    placeholder="Type a name to search..."
                                    value={userSearch}
                                    disabled={!data.election_id}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    className="w-full"
                                />

                                {showDropdown && userSearch && data.election_id && (
                                    <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-300 bg-white text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800">
                                        {(() => {
                                            const selectedElection = elections.find((e) => String(e.id) === data.election_id);

                                            if (!selectedElection) return null;

                                            const eligibleType = selectedElection.participants === 'Officers' ? 'Officer' : 'Member';

                                            // Filter users by search term AND affiliation type
                                            const filteredUsers = users.filter((user) => {
                                                const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`.toLowerCase();
                                                return fullName.includes(userSearch.toLowerCase()) && user.affiliation === eligibleType;
                                            });

                                            return filteredUsers.length > 0 ? (
                                                <ul className="max-h-48 overflow-auto">
                                                    {filteredUsers.map((user) => {
                                                        const fullName = [user.given_name, user.middle_name, user.last_name]
                                                            .filter((n) => n && n.trim() !== '')
                                                            .join(' ');
                                                        return (
                                                            <li
                                                                key={user.id}
                                                                onClick={() => {
                                                                    setUserSearch(fullName);
                                                                    setData('user_id', user.id.toString());
                                                                    setShowDropdown(false);
                                                                }}
                                                                className="cursor-pointer px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            >
                                                                {fullName}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                                    No {eligibleType.toLowerCase()}s found.
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Position Dropdown */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Position</Label>
                                    <Select
                                        disabled={!data.election_id}
                                        value={data.position_id}
                                        onValueChange={(value) => setData('position_id', value)}
                                    >
                                        <SelectTrigger id="position" className="w-full">
                                            <SelectValue placeholder="Choose a position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredPositions.length > 0 ? (
                                                filteredPositions.map((position) => (
                                                    <SelectItem key={position.id} value={String(position.id)}>
                                                        {position.position}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-gray-500">No positions available</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {!data.user_id && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Candidate is required.</p>}
                        {!data.election_id && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Election is required.</p>}
                        {!data.position_id && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Position is required.</p>}

                        <DialogFooter className="mt-4">
                            <Button
                                variant="outline"
                                className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white"
                                onClick={() => {
                                    setOpen(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="cursor-pointer rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                onClick={() => {
                                    setHasAttemptedSubmit(true);

                                    // basic front-end validation before confirmation
                                    if (!data.election_id || !data.user_id || !data.position_id) {
                                        return;
                                    }

                                    setConfirmCandidateOpen(true);
                                }}
                                disabled={processing}
                            >
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                {isEditing ? 'Update Candidate' : 'Save Candidate'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Apply Dialog */}
                <Dialog open={open1} onOpenChange={setOpen1}>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Apply for Candidacy</DialogTitle>
                            <DialogDescription>Select position to apply</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-6">
                                {/* Election Dropdown */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Election</Label>
                                    <Select onValueChange={(value) => setData('election_id', value)}>
                                        <SelectTrigger id="election" className="w-full">
                                            <SelectValue placeholder="Choose an election" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {elections.map((election) => (
                                                <SelectItem key={election.id} value={String(election.id)}>
                                                    {election.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Position Dropdown */}
                                <div>
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Position</Label>
                                    <Select disabled={!data.election_id} onValueChange={(value) => setData('position_id', value)}>
                                        <SelectTrigger id="position" className="w-full">
                                            <SelectValue placeholder="Choose a position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredPositions.length > 0 ? (
                                                filteredPositions.map((position) => (
                                                    <SelectItem key={position.id} value={String(position.id)}>
                                                        {position.position}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-gray-500">No positions available</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {!data.position_id && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Position is required.</p>}

                        <DialogFooter className="mt-4">
                            <Button
                                variant="outline"
                                className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white"
                                onClick={() => {
                                    setOpen1(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="cursor-pointer rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                onClick={() => {
                                    setHasAttemptedSubmit(true);

                                    // front-end validation before confirmation
                                    if (!data.election_id || !data.position_id) {
                                        return;
                                    }

                                    setConfirmApplyOpen(true);
                                }}
                                disabled={processing}
                            >
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Apply Candidacy
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Delete Button with modal trigger */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Candidacy</DialogTitle>
                            <DialogDescription className="mt-4">
                                Are you sure you want to remove this cadidate? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button className="cursor-pointer" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Delete
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm {statusAction?.status}</DialogTitle>
                            <DialogDescription />
                        </DialogHeader>
                        <p>
                            Are you sure you want to set{' '}
                            <strong>
                                {statusAction?.candidate.given_name} {statusAction?.candidate.last_name}
                            </strong>{' '}
                            to <span className="font-semibold">{statusAction?.status}</span>?
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white"
                                onClick={() => setShowStatusModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={statusAction?.status === 'Cancelled' ? 'outline' : 'default'}
                                onClick={() => {
                                    if (statusAction) {
                                        handleStatusChange(statusAction.status);
                                    }
                                    setShowStatusModal(false);
                                }}
                                className={
                                    statusAction?.status === 'Cancelled'
                                        ? 'cursor-pointer bg-red-500 text-white hover:bg-red-800'
                                        : 'cursor-pointer bg-green-500 text-white hover:bg-green-800'
                                }
                            >
                                Yes, {statusAction?.status}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={confirmCandidateOpen} onOpenChange={setConfirmCandidateOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{isEditing ? 'Confirm Candidate Update' : 'Confirm Candidate Addition'}</AlertDialogTitle>

                            <AlertDialogDescription>
                                {isEditing
                                    ? 'Are you sure you want to update this election candidate?'
                                    : 'Are you sure you want to add this candidate to the election?'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="hover:bg-gray-500">No, go back</AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => {
                                    setConfirmCandidateOpen(false);
                                    handleSaveCandidate();
                                }}
                                disabled={processing}
                            >
                                Yes, {isEditing ? 'update' : 'save'} candidate
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={confirmApplyOpen} onOpenChange={setConfirmApplyOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Candidacy Application</AlertDialogTitle>

                            <AlertDialogDescription>
                                Are you sure you want to apply for this position in the selected election?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="hover:bg-gray-500">No, go back</AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => {
                                    setConfirmApplyOpen(false);
                                    setApplyCandidacyOpen(); // your existing submit handler
                                }}
                                disabled={processing}
                            >
                                Yes, apply now
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}
