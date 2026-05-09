import Heading from '@/components/heading';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Candidate, Election, Position, User, type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, CircleX, Hourglass, LoaderCircle, UserPlus, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

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
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedElection, setSelectedElection] = useState<string>('');
    const [confirmCandidateOpen, setConfirmCandidateOpen] = useState(false);
    const [confirmApplyOpen, setConfirmApplyOpen] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        user_id: '',
        election_id: '',
        position_id: '',
    });

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

    const fetchCandidate = async (election_id = '') => {
        try {
            const query = new URLSearchParams({
                election_id,
            }).toString();
            const response = await fetch(`/candidates/approvedCandidates?${query}`);
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
        fetchCandidate(selectedElection);
    }, [selectedElection]);

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
                // Collect error messages (support arrays or strings)
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
        setOpen1(true);
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
                // Collect error messages (support arrays or strings)
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

    function formatServiceYears(startDate: string | Date): string {
        const start = typeof startDate === 'string' ? new Date(startDate.replace(' ', 'T')) : startDate;
        if (isNaN(start.getTime())) return '—';

        const now = new Date();

        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        let days = now.getDate() - start.getDate();

        if (days < 0) {
            months--;
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const parts: string[] = [];
        if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
        if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
        if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

        return parts.join(', ');
    }

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
                                {/* Action Button or Validation Message */}
                                <div className="mt-4">
                                    {data.election_id ? (
                                        (() => {
                                            const selectedElection = elections.find((e) => String(e.id) === data.election_id);

                                            if (!selectedElection) return null;

                                            const electionEligibility = selectedElection.participants;
                                            const userAffiliation = auth?.user?.affiliation;

                                            const isEligible =
                                                (userAffiliation === 'Officer' && electionEligibility === 'Officers') ||
                                                (userAffiliation === 'Member' && electionEligibility === 'Members');

                                            if (isEligible) {
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
                                            } else {
                                                return (
                                                    <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
                                                        ⚠️ Participants for this election are limited to{' '}
                                                        <Badge variant="destructive" className="ml-1 text-xs font-semibold tracking-wide uppercase">
                                                            {electionEligibility === 'Officers' ? 'Officers' : 'Members'}
                                                        </Badge>{' '}
                                                        only.
                                                    </div>
                                                );
                                            }
                                        })()
                                    ) : (
                                        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-400">
                                            Please select an election first.
                                        </div>
                                    )}
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

                                        const stripTime = (date: Date | string) => {
                                            const d = new Date(date); 
                                            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
                                        };

                                        const todayDate = stripTime(today);
                                        const filingStartDate = stripTime(filingStart);
                                        const filingEndDate = stripTime(filingEnd);
                                        const startDate = stripTime(start);
                                        const endDate = stripTime(end);

                                        const filingTotal = filingEndDate.getTime() - filingStartDate.getTime();
                                        let filingWidth = ((todayDate.getTime() - filingStartDate.getTime()) / filingTotal) * 100;
                                        if (todayDate >= filingEndDate) filingWidth = 100;
                                        if (filingWidth <= 0) filingWidth = 0;

                                        const electionTotal = endDate.getTime() - startDate.getTime();
                                        let electionWidth = ((todayDate.getTime() - startDate.getTime()) / electionTotal) * 100;
                                        if (todayDate >= endDate) electionWidth = 100;
                                        if (electionWidth <= 0) electionWidth = 0;


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
                                                                className="absolute h-6 rounded transition-all duration-300"
                                                                style={{
                                                                    width: `${filingWidth}%`,
                                                                    backgroundColor:
                                                                        filingWidth === 100
                                                                            ? "#ef4444" 
                                                                            : filingWidth === 0
                                                                                ? "#9ca3af"
                                                                                : "#22c55e", 
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
                                                                className="absolute h-6 rounded transition-all duration-300"
                                                                style={{
                                                                    width: `${electionWidth}%`,
                                                                    backgroundColor:
                                                                        electionWidth === 0
                                                                            ? "#9ca3af"
                                                                            : electionWidth === 100
                                                                                ? "#ef4444"
                                                                                : "#22c55e",
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
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody className="bg-white dark:bg-gray-900">
                                            {candidates.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="py-6 text-center text-gray-500 dark:text-gray-400">
                                                        No candidates found.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                candidates.map((candidate, index) => (
                                                    <TableRow key={index} className="transition hover:bg-gray-50 dark:hover:bg-gray-800">
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
                                                                        {candidate.given_name} {candidate.middle_name} {candidate.last_name}
                                                                    </h3>
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
                                                                    {candidate.created_at && (
                                                                        <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                                                            {formatServiceYears(candidate.created_at)} in Service
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
                            <div className="relative flex flex-col gap-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Candidate</Label>

                                <Input
                                    required
                                    type="text"
                                    placeholder="Type a name to search..."
                                    value={userSearch}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    className="w-full"
                                />

                                {showDropdown && userSearch && (
                                    <div className="absolute top-full z-50 mt-1 w-full rounded-md border border-gray-300 bg-white text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800">
                                        {users.filter((user) => {
                                            const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`.toLowerCase();
                                            return fullName.includes(userSearch.toLowerCase());
                                        }).length > 0 ? (
                                            <ul className="max-h-48 overflow-auto">
                                                {users
                                                    .filter((user) => {
                                                        const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`.toLowerCase();
                                                        return fullName.includes(userSearch.toLowerCase());
                                                    })
                                                    .map((user) => {
                                                        const fullName = [user.given_name, user.middle_name, user.last_name]
                                                            .filter((name) => name && name.trim() !== '')
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
                                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No members found.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6">
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
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setOpen(false);
                                }}
                            >
                                Cancel
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
                        {!data.election_id && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Election is required.</p>}
                        <DialogFooter className="mt-4">
                            <Button
                                variant="destructive"
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
