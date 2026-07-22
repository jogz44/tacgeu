import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/date';
import { User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, Calendar, CalendarDays, CheckCircle, ChevronDown, ChevronRight, CircleOff, CircleX, ClipboardList, FileText, ListPlus, LoaderCircle, Pencil, RefreshCcw, Timer, Trash2, UserCircle, Users, Vote } from 'lucide-react';
import { useState } from 'react';
import { FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import React from 'react';
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
        title: 'Elections',
        href: '/tacgeu/elections',
    },
];

interface Elections {
    id: number;
    user: User;
    title: string;
    participants: string;
    voters: string;
    filing_start_date: string;
    filing_end_date: string;
    start_date: string;
    end_date: string;
    created_at: string;
    status: string;
    remarks: string;
}

interface ElectionsPageProps {
    elections: {
        data: Elections[];
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export default function elections() {
    const { elections } = usePage().props as unknown as ElectionsPageProps;
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedElection, setSelectedElection] = useState<Elections | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [status, setStatus] = useState("")
    const [remarks, setRemarks] = useState("");
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);

    const fetchElection = (search = '', status = '') => {
        router.get(
            '/tacgeu/elections',
            {
                search,
                status,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSort = (field: string) => {
        const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        router.get(
            '/tacgeu/elections',
            {
                search: searchTerm,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const { data, setData, post, put, processing, reset } = useForm({
        title: '',
        filing_start_date: '',
        filing_end_date: '',
        start_date: '',
        end_date: '',
        participants: '',
        voters: '',
    });

    const handleSave = () => {
        if (!data.title.trim() || !data.filing_start_date || !data.filing_end_date || !data.start_date || !data.end_date) {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (!isEditing) {
            // Check if there's already an open election
            const hasOpenElection = elections.data.some(
                (election) => election.status === "Open"
            );

            if (hasOpenElection) {
                toast.error('An election is currently open. You cannot create a new one until it closes.');
                return;
            }
            post(route('elections.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    toast.success(`Message`, {
                        description: `New election has been recorded.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 2000,
                    });
                    reset();
                },
                onError: (errors) => {
                    toast.error(`Error`, {
                        description: errors.open,
                        icon: <CircleX className="h-5 w-5 text-red-600" />,
                        duration: 2000,
                    });
                    console.error('Failed to add new Election:', errors);
                },
            });
        } else {
            if (!selectedElection) {
                toast.error('No election selected for editing.');
                return;
            }
            put(route('elections.update', selectedElection.id), {
                ...data,
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    toast.success(`Message`, {
                        description: `Election has been updated successfully.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 3500,
                    });
                    reset();
                    setIsEditing(false);
                    setSelectedElection(null);
                },
                onError: (errors) => {
                    toast.error(`Error`, {
                        description: errors.open || 'An error occurred while updating the election.',
                        icon: <CircleX className="h-5 w-5 text-red-600" />,
                        duration: 3500,
                    });
                    console.error('Failed to update Election:', errors);
                },
            });
        }
    };

    function parseLocalDate(dateStr: string): Date {
        const [year, month, day] = dateStr.split('-').map(Number);
        // Month is zero-based in JS Date
        return new Date(year, month - 1, day);
    }

    const handleDelete = () => {
        setIsDeleting(true);
        try {
            if (!selectedElection?.id) return;
            setIsDeleting(true);
            router.delete(route('elections.destroy', selectedElection.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    toast.success('Message', {
                        description: 'The collection has been successfully deleted.',
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 3500,
                    });
                    setIsDeleting(false);
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
            });
            setShowDeleteModal(false);
            setSelectedElection(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleUpdateStatus = () => {
        if (!selectedElection?.id) return

        router.put(
            route("elections.updateStatus", { election: selectedElection.id }), // <-- pass object with election
            { status: status, remarks: remarks },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Election status updated!", {
                        description: `Status changed to ${status}`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    });
                    setShowStatusModal(false);
                },
                onError: (errors) => {
                    toast.error("Error updating status", {
                        description: Object.values(errors).join(", "),
                        icon: <CircleX className="h-5 w-5 text-red-500" />,
                    });
                },
            }
        );

    }

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Elections" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title="TACGEU Elections" description="Records of all election incurred by the TACGEU." />
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <Input
                                    placeholder="Search by election name"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        fetchElection(value);
                                    }}
                                    className="w-full md:max-w-sm"
                                />
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSearchTerm('');
                                        fetchElection('', '');
                                    }}
                                >
                                    <FaRedo className="mr-2" /> {/* Refresh Icon */}
                                    Reset
                                </Button>
                                <Button
                                    className="ml-auto cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                    onClick={() => {
                                        reset(); // Reset form data
                                        setSelectedElection(null); // Clear the previous selection
                                        setIsEditing(false); // Set to creation mode
                                        setShowModal(true); // Open modal
                                    }}
                                >
                                    <ListPlus className="mr-2" />
                                    New Election
                                </Button>
                            </div>
                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full text-sm">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="px-3 py-3 cursor-pointer text-white hover:bg-teal-700 dark:hover:bg-teal-600"
                                                onClick={() => handleSort("given_name")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <UserCircle className="h-4 w-4" /> Creator
                                                    {sortBy === "given_name" &&
                                                        (sortDirection === "asc" ? (
                                                            <ArrowDownAZ className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ArrowUpZA className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>

                                            <TableHead
                                                className="cursor-pointer text-white hover:bg-teal-700 dark:hover:bg-teal-600"
                                                onClick={() => handleSort("title")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <FileText className="h-4 w-4" /> Election
                                                    {sortBy === "title" &&
                                                        (sortDirection === "asc" ? (
                                                            <ArrowDownAZ className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ArrowUpZA className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-white hover:bg-teal-700 dark:hover:bg-teal-600"
                                                onClick={() => handleSort("created_at")}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" /> Created
                                                    {sortBy === "created_at" &&
                                                        (sortDirection === "asc" ? (
                                                            <ArrowDown01 className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ArrowUp10 className="ml-1 h-4 w-4" />
                                                        ))}
                                                </div>
                                            </TableHead>

                                            <TableHead className="text-white text-center">Status</TableHead>
                                            <TableHead className="text-white text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {elections.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-6 text-center text-gray-500">
                                                    No election data found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            elections.data.map((election) => {
                                                const isExpanded = expandedRow === election.id;
                                                return (
                                                    <React.Fragment key={election.id}>
                                                        {/* Main Row */}
                                                        <TableRow
                                                            onClick={() =>
                                                                setExpandedRow(isExpanded ? null : election.id)
                                                            }
                                                            className={`cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${isExpanded ? "bg-gray-50 dark:bg-gray-800/60" : ""
                                                                }`}
                                                        >
                                                            {/* CREATOR */}
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    {/* Expand/Collapse icon */}
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="h-4 w-4 text-teal-600 transition-transform" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4 text-gray-500 transition-transform" />
                                                                    )}
                                                                    <span className="text-gray-900 dark:text-white">
                                                                        {election.user.given_name} {election.user.last_name}
                                                                    </span>
                                                                </div>
                                                            </TableCell>

                                                            {/* TITLE */}
                                                            <TableCell className=" text-gray-800 dark:text-gray-200">
                                                                {election.title}
                                                            </TableCell>

                                                            {/* CREATED_AT */}
                                                            <TableCell className=" text-gray-800 dark:text-gray-200">
                                                                {formatDate(election.created_at)}
                                                            </TableCell>

                                                            {/* STATUS */}
                                                            <TableCell className="text-center">
                                                                {election.status === "Open" ? (
                                                                    <Badge className="bg-green-500 text-white flex items-center gap-1 justify-center">
                                                                        <CheckCircle className="h-4 w-4" /> Open
                                                                    </Badge>
                                                                ) : election.status === "Closed" ? (
                                                                    <Badge className="bg-gray-400 text-white flex items-center gap-1 justify-center">
                                                                        <CircleX className="h-4 w-4" /> Closed
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-red-500 text-white flex items-center gap-1 justify-center">
                                                                        <CircleOff className="h-4 w-4" /> Void
                                                                    </Badge>
                                                                )}
                                                            </TableCell>

                                                            {/* ACTIONS */}
                                                            <TableCell className="flex justify-center gap-2">
                                                                {election.status === "Open" && (
                                                                    <TooltipProvider>
                                                                        <>
                                                                            {/* Update Status button */}
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="bg-yellow-500 text-white hover:bg-yellow-600"
                                                                                        onClick={() => {
                                                                                            setSelectedElection(election);
                                                                                            setShowStatusModal(true);
                                                                                        }}
                                                                                    >
                                                                                        <RefreshCcw className="h-4 w-4" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Update Status</TooltipContent>
                                                                            </Tooltip>

                                                                            {/* Edit button */}
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="bg-white text-gray-600 hover:bg-blue-600 hover:text-white"
                                                                                        onClick={() => {
                                                                                            setIsEditing(true);
                                                                                            setData({
                                                                                                title: election.title,
                                                                                                filing_start_date: election.filing_start_date,
                                                                                                filing_end_date: election.filing_end_date,
                                                                                                start_date: election.start_date,
                                                                                                end_date: election.end_date,
                                                                                                participants: election.participants,
                                                                                                voters: election.voters
                                                                                            });
                                                                                            setSelectedElection(election);
                                                                                            setShowModal(true);
                                                                                        }}
                                                                                    >
                                                                                        <Pencil className="h-4 w-4" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Edit Election</TooltipContent>
                                                                            </Tooltip>

                                                                            {/* Delete button */}
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="destructive"
                                                                                        className="bg-red-500 hover:bg-red-800"
                                                                                        onClick={() => {
                                                                                            setSelectedElection(election);
                                                                                            setShowDeleteModal(true);
                                                                                        }}
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Delete Election</TooltipContent>
                                                                            </Tooltip>
                                                                        </>
                                                                    </TooltipProvider>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>

                                                        {/* Expandable Section */}
                                                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                                            <TableCell colSpan={5} className="p-0">
                                                                <div
                                                                    className={`transition-all duration-300 overflow-hidden ${isExpanded ? "max-h-96 p-4" : "max-h-0"
                                                                        }`}
                                                                >

                                                                    {isExpanded && (
                                                                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                                                                            {/* Filing Period */}
                                                                            <div className="rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                                                                <h4 className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                                                                    <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                                    Filing Period
                                                                                </h4>

                                                                                {formatDate(election.filing_start_date) === formatDate(election.filing_end_date) ? (
                                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                                        <strong>{formatDate(election.filing_start_date)}</strong>
                                                                                    </p>
                                                                                ) : (
                                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                                        From <strong>{formatDate(election.filing_start_date)}</strong> to{" "}
                                                                                        <strong>{formatDate(election.filing_end_date)}</strong>
                                                                                    </p>
                                                                                )}
                                                                            </div>

                                                                            {/* Election Dates */}
                                                                            <div className="rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                                                                <h4 className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                                                                    <Vote className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                                                    Election Dates
                                                                                </h4>

                                                                                {formatDate(election.start_date) === formatDate(election.end_date) ? (
                                                                                    <p className="text-gray-700 dark:text-gray-300">
                                                                                        <strong>{formatDate(election.start_date)}</strong>
                                                                                    </p>
                                                                                ) : (
                                                                                    <div className="text-gray-700 dark:text-gray-300">
                                                                                        <p>
                                                                                            Start: <strong>{formatDate(election.start_date)}</strong>
                                                                                        </p>
                                                                                        <p>
                                                                                            End: <strong>{formatDate(election.end_date)}</strong>
                                                                                        </p>
                                                                                    </div>
                                                                                )}
                                                                            </div>


                                                                            {/* Participants */}
                                                                            <div className="rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                                                                <h4 className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                                                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                                    Eligible Participants
                                                                                </h4>
                                                                                <p>
                                                                                    {election.participants === "Officers"
                                                                                        ? "For Officers Only"
                                                                                        : "For All Members"}
                                                                                </p>
                                                                            </div>

                                                                            {/* Voters */}
                                                                            <div className="rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                                                                <h4 className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                                                                    <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                                    Voters
                                                                                </h4>
                                                                                <p>
                                                                                    {election.voters === "Officers"
                                                                                        ? "For Officers Only"
                                                                                        : "For All Members"}
                                                                                </p>
                                                                            </div>

                                                                            {/* Remarks — FULL WIDTH */}
                                                                            <div className="md:col-span-2 rounded-lg border p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                                                                <h4 className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
                                                                                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                                    Remarks
                                                                                </h4>
                                                                                <p className="whitespace-pre-wrap">{election.remarks ? election.remarks : 'N/A'}</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Controls */}
                            {elections && elections.links && elections.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {elections.links.map((link, index) => (
                                            <PaginationItem key={index}>
                                                &nbsp;
                                                {link.url ? (
                                                    <PaginationLink
                                                        onClick={() => router.visit(link.url!)}
                                                        isActive={link.active}
                                                        className={`mx-2 ${link.active ? 'cursor-pointer bg-gray-200 dark:bg-gray-700' : ''} cursor-pointer`}
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    </PaginationLink>
                                                ) : (
                                                    <span className="cursor-not-allowed text-gray-500">
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    </span>
                                                )}
                                            </PaginationItem>
                                        ))}
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    </div>
                </div>
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Election' : 'Add New Election'}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? 'Update the details of the Election.' : 'Enter details about this Election.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave();
                            }}
                        >
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Election Title
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.title}
                                        onChange={(e) => setData({ ...data, title: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>

                                {/* ✅ New Field for Eligible Participants (Full Width) */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="eligibility" className="text-right">
                                        Participants
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={data.participants}
                                            onValueChange={(value) => setData({ ...data, participants: value })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select eligibility paticipants" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                <SelectItem value="Officers">Officers</SelectItem>
                                                <SelectItem value="Members">Members</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* ✅ New Field for Eligible Participants (Full Width) */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="eligibility" className="text-right">
                                        Eligible Voters
                                    </Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={data.voters}
                                            onValueChange={(value) => setData({ ...data, voters: value })}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select eligibility voters" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                <SelectItem value="Officers">Officers</SelectItem>
                                                <SelectItem value="Members">Members</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="start_date" className="text-right">
                                        Start of Filing Period
                                    </Label>
                                    <Input
                                        id="filing_start_date"
                                        type="date"
                                        value={data.filing_start_date}
                                        onChange={(e) => setData({ ...data, filing_start_date: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="start_date" className="text-right">
                                        End of Filing Period
                                    </Label>
                                    <Input
                                        id="filing_end_date"
                                        type="date"
                                        value={data.filing_end_date}
                                        onChange={(e) => setData({ ...data, filing_end_date: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="start_date" className="text-right">
                                        Election Date
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData({ ...data, start_date: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="end_date" className="text-right">
                                        End Date
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData({ ...data, end_date: e.target.value })}
                                        className="col-span-3"
                                        required
                                    />
                                </div>
                            </div>


                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={processing}
                                    className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                >
                                    {processing ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5" />
                                    )}
                                    {isEditing ? 'Update' : 'Create Election'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Button with modal trigger */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Election</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this election? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end gap-2">

                            <Button variant="outline" className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>

                            <Button className="cursor-pointer" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Status Update Modal */}
                <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <RefreshCcw className="h-5 w-5 text-yellow-500" /> Update Election Status
                            </DialogTitle>
                            <DialogDescription>
                                Select a new status for this election. Changing the status will affect visibility and participation.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open">🟢 Open</SelectItem>
                                    <SelectItem value="Closed">⚪ Closed</SelectItem>
                                    <SelectItem value="Void">🔴 Void</SelectItem>
                                </SelectContent>
                            </Select>

                            <div>
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Enter remarks (optional)"
                                    className="mt-1"
                                    rows={4}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white" onClick={() => setShowStatusModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setConfirmStatusOpen(true)}
                                disabled={!status || status === selectedElection?.status}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                                Update
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isEditing ? 'Confirm Election Update' : 'Confirm Election Creation'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isEditing
                                    ? 'Are you sure you want to update this election?'
                                    : 'Are you sure you want to create this election?'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className='hover:bg-gray-500'>
                                No, go back
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    handleSave();
                                }}
                                disabled={processing}
                            >
                                Yes, {isEditing ? 'update' : 'create'} election
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog
                    open={confirmStatusOpen}
                    onOpenChange={setConfirmStatusOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Confirm Status Change
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                You are about to change the election status
                                {status && (
                                    <>
                                        {' '}to <span className="font-semibold">{status}</span>
                                    </>
                                )}.
                                This will affect election visibility and voter participation.
                                Are you sure you want to continue?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className='hover:bg-gray-500'>
                                No, go back
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => {
                                    setConfirmStatusOpen(false);
                                    handleUpdateStatus();
                                }}
                            >
                                Yes, update status
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}
