import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, CheckCircle, LoaderCircle, PackagePlus } from 'lucide-react';
import { useState } from 'react';
import { FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Membership Fee',
        href: '/tacgeu/membership_fee',
    },
];

function formatDate(dateInput: string | Date): string {
    const date = new Date(dateInput);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

export default function expenses() {
    const { collections } = usePage().props as unknown as CollectionPageProps;
    const users: User[] = (usePage().props.users as User[]) || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const { auth } = usePage().props as any;
    const [isSaving, setIsSaving] = useState(false);
    const [isCanceled, setIsCanceled] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isRejected, setIsRejected] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [open, setOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    // Define the Expenses interface
    interface Collection {
        id: number;
        name: string;
        description: string;
        amount: string;
        created_at: string;
    }

    interface CollectionPageProps {
        collections: {
            data: Collection[];
            current_page: number;
            last_page: number;
            links: {
                url: string | null;
                label: string;
                active: boolean;
            }[];
        };
    }

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        description: '',
        amount: '',
    });

    const fetchCollection = (search = '') => {
        router.get(
            '/tacgeu/collections',
            {
                search,
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
            '/tacgeu/collections',
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

    const handleSaveCollection = () => {
        post(route('collections.store'), {
            onSuccess: () => {
                setOpen(false);
                toast.success(`Collection`, {
                    description: `New Colelction has been recorded.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2500,
                });
                reset(); // Clear form
                setUserSearch('');
            },
            onError: (errors) => {
                toast.error('Failed to add new collection', {
                    description: errors?.name ?? errors?.amount ?? errors?.description ?? 'An unexpected error occurred.',
                });
                console.error('Failed to add new collection', errors);
            },
        });
        2;
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Payments" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title="TACGEU Collections" description="Records of all collectons incured by TACGEU." />
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                {/* Search Input */}
                                <Input
                                    placeholder="Search by Name or Email..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        fetchCollection(value);
                                    }}
                                    className="w-full md:max-w-sm"
                                />

                                {/* Reset Button */}
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSearchTerm('');
                                        fetchCollection('');
                                    }}
                                >
                                    <FaRedo className="mr-2" />
                                    Reset
                                </Button>

                                {/* Button Group aligned right */}
                                <div className="ml-auto flex gap-2">
                                    <Button
                                        className="cursor-pointer items-center justify-center gap-2 rounded-md bg-red-600 text-white transition-colors duration-200 hover:bg-red-700"
                                        onClick={() => setOpen(true)}
                                    >
                                        <PackagePlus className="mr-2" />
                                        New Collection
                                    </Button>
                                </div>
                            </div>

                            <div className="w-full overflow-x-auto">
                                <Table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer px-6 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('name')}
                                            >
                                                Name
                                                {sortBy === 'name' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer px-6 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('description')}
                                            >
                                                Description
                                                {sortBy === 'description' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer px-6 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('amount')}
                                            >
                                                Amount
                                                {sortBy === 'amount' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer px-6 py-3 text-center text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Date Created
                                                {sortBy === 'created_at' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead className="px-6 py-3 text-xs font-medium tracking-wider text-white uppercase dark:text-gray-300"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {collections.data.map((collection) => (
                                            <TableRow key={collection.id}>
                                                <TableCell className="px-6 py-4 break-words whitespace-normal">{collection.name}</TableCell>
                                                <TableCell className="px-6 py-4 break-words whitespace-normal">{collection.description}</TableCell>
                                                <TableCell className="break-words whitespace-normal text-red-500">
                                                    ₱ {Number(collection.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="text-center break-words whitespace-normal">
                                                    {formatDate(collection.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Controls */}
                            {collections && collections.links && collections.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {collections.links.map((link, index) => (
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

                {/* Payment Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Collection</DialogTitle>
                            <DialogDescription>Enter the details for the new monthly due payment.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-4">
                                {/* Name of Payment */}
                                <label htmlFor="paymentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name of Payment
                                </label>
                                <Input
                                    id="paymentName"
                                    required
                                    placeholder="e.g. Donation"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                            </div>
                            {/* Description Textarea */}
                            <div className="space-y-1">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter collection description..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">₱</span>
                                <Input
                                    required
                                    placeholder="Amount"
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    className="pl-8" // adds padding so text doesn’t overlap with ₱
                                />
                            </div>
                        </div>

                        {!data.name && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Collection name is required.</p>}
                        {!data.description && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Description is required.</p>}
                        {!data.amount && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Amount is required.</p>}

                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setOpen(false);
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <Button
                                className="ml-auto cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                onClick={() => {
                                    setHasAttemptedSubmit(true);
                                    handleSaveCollection();
                                }} // Change endpoint as needed
                                disabled={processing}
                            >
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Save Collection
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
