import Heading from '@/components/heading';
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
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/date';
import { User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, CheckCircle, CircleX, LoaderCircle, PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Collections',
        href: '/collections',
    },
];

export default function expenses() {
    const { collections } = usePage().props as unknown as CollectionPageProps;
    const users: User[] = (usePage().props.users as User[]) || [];
    const [searchTerm, setSearchTerm] = useState('');
    const { auth } = usePage().props as any;
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [open, setOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isUpdate, setUpdate] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [editData, setEditData] = useState({
        id: '',
        name: '',
        description: '',
        amount: '',
    });
    // Define the Expenses interface
    interface Collection {
        id: number;
        name: string;
        description: string;
        amount: string;
        status: string;
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

    const fullName = [
        auth.user.given_name,
        auth.user.middle_name,
        auth.user.last_name,
        auth.user.suffix,
    ]
        .filter(Boolean)
        .join(" ");

    const { data, setData, post, processing, reset } = useForm({
        name: '',
        description: '',
        amount: '',
    });

    const fetchCollection = (search = '') => {
        router.get(
            '/collections',
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
            '/collections',
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

    const handleDelete = () => {
        if (!selectedCollection?.id) return;
        setIsDeleting(true);
        router.delete(route('collections.destroy', selectedCollection.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                toast.success('Collection deleted', {
                    description: 'The collection has been successfully deleted.',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2500,
                });
                setIsDeleting(false);
            },
            onError: (errors) => {
                toast.error('Delete failed', {
                    description: errors.error,
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 2500,
                });
                setIsDeleting(false);
            },
        });
    };

    const handleSaveCollection = () => {
        post(route('collections.store'), {
            onSuccess: () => {
                setOpen(false);
                toast.success(`Collection Save`, {
                    description: `New Collection has been recorded.`,
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
    };

    const handleUpdateCollection = () => {
        router.post(route('collections.update'), editData, {
            onSuccess: () => {
                setUpdate(false);
                toast.success(`Collection Update`, {
                    description: `Collection has been updated.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2500,
                });
            },
            onError: (errors) => {
                toast.error('Collection Update', {
                    description: errors?.name ?? errors?.amount ?? errors?.description ?? 'An unexpected error occurred.',
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 2500,
                });
                setUpdate(false);
            },
            onFinish: () => setUpdate(false),
        });
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Receipts" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title="TACGEU Collections" description="Records of all collectons incured by TACGEU." />
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                {/* Search Input */}
                                <Input
                                    placeholder="Search by Name..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        fetchCollection(value);
                                    }}
                                    className="w-full"
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
                                        className="cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                        onClick={() => setOpen(true)}
                                    >
                                        <PackagePlus className="mr-2" />
                                        New Collection
                                    </Button>
                                </div>
                            </div>

                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                                className="uppcase cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                            <TableHead className="text-sm tracking-wider text-white dark:text-gray-300"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {collections.data.map((collection) => (
                                            <TableRow key={collection.id}>
                                                <TableCell className="break-words whitespace-normal">{collection.name}</TableCell>
                                                <TableCell className="break-words whitespace-normal">{collection.description}</TableCell>
                                                <TableCell className="break-words whitespace-normal text-red-500">
                                                    ₱ {Number(collection.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="break-words whitespace-normal">{formatDate(collection.created_at)}</TableCell>
                                                <TableCell className="flex gap-2">
                                                    {/* Edit Button */}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedCollection(collection);
                                                                        setEditData({
                                                                            id: collection.id.toString(),
                                                                            name: collection.name,
                                                                            description: collection.description,
                                                                            amount: collection.amount,
                                                                        });
                                                                        setShowEditModal(true);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" align="center">
                                                                Edit Collection
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    {/* Delete Button */}
                                                    {collection.status !== 'Default' && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="icon"
                                                                        className="cursor-pointer"
                                                                        onClick={() => {
                                                                            setSelectedCollection(collection);
                                                                            setShowDeleteModal(true);
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" align="center">
                                                                    Delete Collection
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
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

                {/* Collection Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Collection</DialogTitle>
                            <DialogDescription>Enter the details for the new monthly due receipts.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-4">
                                {/* Name of Payment */}
                                <label htmlFor="paymentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name of Receipts
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
                            <Label htmlFor="Amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Amount
                            </Label>
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
                {/* Delete Button with modal trigger */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Collection</DialogTitle>
                            <DialogDescription>Are you sure you want to delete this collection? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button className="cursor-pointer" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Delete
                            </Button>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {showEditModal && (
                    <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Collection</DialogTitle>
                                <DialogDescription>Update the collection details below.</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <Label htmlFor="paymentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name of Receipts
                                </Label>
                                <Input
                                    placeholder="Name"
                                    value={editData.name}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                                <Label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Description
                                </Label>
                                <Textarea
                                    placeholder="Description"
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                />
                                <Label htmlFor="Amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Amount
                                </Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">₱</span>
                                    <Input
                                        placeholder="Amount"
                                        type="number"
                                        value={editData.amount}
                                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                        className="pl-8"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="ml-auto cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        handleUpdateCollection();
                                    }}
                                    disabled={isUpdate}
                                >
                                    {isUpdate ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                    Save
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </AppLayout>
        </>
    );
}
