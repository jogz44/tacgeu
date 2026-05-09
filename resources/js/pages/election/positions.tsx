import Heading from '@/components/heading';
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
import { Elections, User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, CheckCircle, CircleX, LoaderCircle, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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
        title: 'Positions',
        href: '/positions',
    },
];
// Define the Expenses interface
interface Positions {
    id: number;
    election: Elections;
    position: string;
    slots: string;
    end_date: string;
    created_at: string;
}

interface Election {
    id: number;
    user: User;
    title: string;
    start_date: string;
    end_date: string;
    created_at: string;
}

interface PositionPageProps {
    positions: {
        data: Positions[];
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    elections: Election[];
}

function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

export default function positions() {
    const { positions } = usePage().props as unknown as PositionPageProps || [];
    const { elections } = usePage().props as unknown as { elections: Election[] };
    const [showModal, setShowModal] = useState(false);
    const [selectedElection, setSelectedElection] = useState(
        elections.length > 0 ? String(elections[0].id) : ""
    );
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Positions | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmPositionOpen, setConfirmPositionOpen] = useState(false);

    const fetchPosition = (election_id = '') => {
        router.get(
            '/positions',
            {
                election_id,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    console.log(positions);

    const handleSort = (field: string) => {
        const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        router.get(
            '/positions',
            {
                election_id: selectedElection,
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
        election_id: '',
        position: '',
        slots: '',
    });

    const handleSave = () => {
        if (!data.election_id.trim() || !data.position.trim() || !data.slots) {
            toast.error('Please fill in all required fields.');
            return;
        }

        if (!isEditing) {
            post(route('positions.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    toast.success(`Message`, {
                        description: `New Position has been recorded.`,
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
                    console.error('Failed to add new Position:', errors);
                },
            });
        } else {
            if (!selectedPosition) {
                toast.error('No position selected for editing.');
                return;
            }
            put(route('positions.update', selectedPosition.id), {
                ...data,
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    toast.success(`Message`, {
                        description: `Position has been updated successfully.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 3500,
                    });
                    reset();
                    setIsEditing(false);
                    setSelectedPosition(null);
                },
                onError: (errors) => {
                    toast.error(`Error`, {
                        description: errors.open || 'An error occurred while updating the Position.',
                        icon: <CircleX className="h-5 w-5 text-red-600" />,
                        duration: 3500,
                    });
                    console.error('Failed to update Election:', errors);
                },
            });
        }
    };

    const isElectionOpen = (election: Election) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Local midnight

        const start = parseLocalDate(election.start_date);
        const end = parseLocalDate(election.end_date);
        return start >= today && end >= today;
    };

    const handleDelete = () => {
        setIsDeleting(true);
        try {
            if (!selectedPosition?.id) return;
            setIsDeleting(true);
            router.delete(route('positions.destroy', selectedPosition.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    toast.success('Message', {
                        description: 'The position has been successfully deleted.',
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
            setSelectedPosition(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Positions" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title="TACGEU Electoral Positions" description="Records of all electoral positions incurred by the TACGEU." />
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <Select
                                    onValueChange={(value) => {
                                        setSelectedElection(value);
                                        fetchPosition(value);
                                    }}
                                    value={selectedElection}
                                >
                                    <SelectTrigger className="w-full md:max-w-sm">
                                        <SelectValue placeholder="Filter by Election" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {elections.map((election) => (
                                            <SelectItem key={election.id} value={String(election.id)}>
                                                {election.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSelectedElection('');
                                        fetchPosition('');
                                    }}
                                >
                                    <FaRedo className="mr-2" /> {/* Refresh Icon */}
                                    Reset
                                </Button>
                                <Button
                                    className="ml-auto cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                    onClick={() => {
                                        reset(); // Reset form data
                                        setSelectedPosition(null); // Clear the previous selection
                                        setIsEditing(false); // Set to creation mode
                                        setShowModal(true); // Open modal
                                    }}
                                >
                                    <UserPlus className="mr-2" />
                                    New Position
                                </Button>
                            </div>
                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('position')}
                                            >
                                                Positions
                                                {sortBy === 'position' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-center text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('slots')}
                                            >
                                                Vote Count per Position
                                                {sortBy === 'slots' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead className="text-sm tracking-wider break-words whitespace-normal text-white">
                                                Date Created
                                            </TableHead>
                                            <TableHead className="text-sm text-white"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {positions?.data?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="py-8 text-center text-sm text-gray-500">
                                                    No position data found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            positions?.data?.map((position) => (
                                                <TableRow key={position.id}>
                                                    <TableCell className="break-words whitespace-normal">{position.position}</TableCell>
                                                    <TableCell className="text-center break-words whitespace-normal">{position.slots}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{formatDate(position.created_at)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-2">
                                                            {/* Update Button with Tooltip */}
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="cursor-pointer"
                                                                            onClick={() => {
                                                                                setIsEditing(true);
                                                                                setData({
                                                                                    election_id: String(position.election.id),
                                                                                    position: position.position,
                                                                                    slots: position.slots,
                                                                                });
                                                                                setSelectedPosition(position);
                                                                                setShowModal(true);
                                                                            }}
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Update Position</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>

                                                            {/* Delete Button with Tooltip */}
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="icon"
                                                                            onClick={() => {
                                                                                setSelectedPosition(position);
                                                                                setShowDeleteModal(true);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Remove Position</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Controls */}
                            {positions && positions.links && positions.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {positions.links.map((link, index) => (
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
                            <DialogTitle>{isEditing ? 'Edit Position' : 'Add New Position'}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? 'Update the details of the Position.' : 'Enter details about this Position.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!data.election_id) {
                                    toast.error('Select a election.');
                                    return;
                                }
                                handleSave();
                            }}
                        >
                            <div className="grid gap-4 py-4">
                                {/* Election Selector */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="election" className="text-right">
                                        Election
                                    </Label>
                                    <Select onValueChange={(value) => setData('election_id', value)} value={data.election_id} required>
                                        <SelectTrigger id="election" className="col-span-3">
                                            <SelectValue placeholder="Select an election" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-60 overflow-y-auto">
                                            {elections.filter(isElectionOpen).length === 0 ? (
                                                <div className="text-muted-foreground px-4 py-2 text-sm">No open elections available</div>
                                            ) : (
                                                elections.filter(isElectionOpen).map((election) => (
                                                    <SelectItem key={election.id} value={String(election.id)}>
                                                        {election.title}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Position Name */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="position" className="text-right">
                                        Position
                                    </Label>
                                    <Input
                                        id="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        className="col-span-3"
                                        placeholder="e.g. President"
                                        required
                                    />
                                </div>

                                {/* Slots */}
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="slots" className="text-right">
                                        Vote Count per Position
                                    </Label>
                                    <Input
                                        id="slots"
                                        type="number"
                                        value={data.slots}
                                        onChange={(e) => setData('slots', e.target.value)}
                                        className="col-span-3"
                                        min={1}
                                        required
                                    />
                                </div>
                            </div>

                            <DialogFooter className="mt-4">
                                <Button type="button" variant="outline" className="bg-white text-gray-700 hover:bg-gray-500 hover:text-white" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (!data.election_id) {
                                            toast.error('Select an election.');
                                            return;
                                        }
                                        setConfirmPositionOpen(true);
                                    }}
                                    disabled={processing}
                                    className="flex cursor-pointer items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                                >
                                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                    {isEditing ? 'Update Position' : 'Create Position'}
                                </Button>

                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Delete Button with modal trigger */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Position</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this position? This action cannot be undone.</DialogDescription>
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

                <AlertDialog
                    open={confirmPositionOpen}
                    onOpenChange={setConfirmPositionOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {isEditing ? 'Confirm Position Update' : 'Confirm Position Creation'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {isEditing
                                    ? 'Are you sure you want to update this position?'
                                    : 'Are you sure you want to create this position?'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className='hover:bg-gray-500'>
                                No, go back
                            </AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => {
                                    setConfirmPositionOpen(false);
                                    handleSave();
                                }}
                                disabled={processing}
                            >
                                Yes, {isEditing ? 'update' : 'create'} position
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}
