import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, CheckCircle, CircleX, CreditCard, Eye, LoaderCircle, Trash, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Disbursements',
        href: '/expenses',
    },
];

export default function expenses() {
    const { expenses } = usePage().props as unknown as ExpensesPageProps;
    const { filteredStatus } = usePage().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDues, setFilteredDues] = useState<Expenses[]>(expenses.data);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expenses | null>(null);
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const title =
        filteredStatus === 'Rejected'
            ? 'Rejected Disbursements'
            : filteredStatus === 'Pending'
              ? 'Pending Disbursements'
              : filteredStatus === 'Approved'
                ? 'Approved Disbursements'
                : filteredStatus === 'Canceled'
                  ? 'Canceled Disbursements'
                  : 'All Disbursements';
    const description =
        filteredStatus === 'Rejected'
            ? 'Records of all rejected disbursements incurred by the TACGEU.'
            : filteredStatus === 'Pending'
              ? 'Records of all pending disbursements incurred by the TACGEU.'
              : filteredStatus === 'Approved'
                ? 'Records of all approved disbursements incurred by the TACGEU.'
                : filteredStatus === 'Canceled'
                  ? 'Records of all canceled disbursements incurred by the TACGEU.'
                  : 'Records of all disbursements incurred by the TACGEU.';

    // Define the Expenses interface
    interface Expenses {
        id: number;
        user: User;
        name: string;
        payee: string;
        check: string;
        description: string;
        spent_at: string;
        amount: string;
        status: string;
        created_at: string;
        remarks: string;
        documents: File | null;
    }

    interface ExpensesPageProps {
        expenses: {
            data: Expenses[];
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
        payee: '',
        check: '',
        amount: '',
        spent_at: '',
        remarks: '',
        documents: '',
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0];
        if (pdfFile && pdfFile.type === 'application/pdf') {
            const uniqueName = `${Date.now()}_${pdfFile.name}`;
            const renamedFile = new File([pdfFile], uniqueName, { type: pdfFile.type });
            setPdfFile(renamedFile); // Store the File object in state
            setData('documents', uniqueName); // Store only the file name in form state
        } else {
            alert('Only PDF files are allowed.');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': [] },
        maxFiles: 1,
    });

    const fetchExpenses = (search = '', status = '') => {
        router.get(
            '/expenses',
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
            '/expenses',
            {
                search: searchTerm,
                status: selectedStatus,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSave = () => {
        if (pdfFile && pdfFile.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed.');
            return;
        }
        setIsSaving(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('payee', data.payee);
        formData.append('check', data.check);
        formData.append('description', data.description);
        formData.append('amount', data.amount);
        formData.append('spent_at', data.spent_at);
        formData.append('remarks', data.remarks);

        if (pdfFile) {
            formData.append('documents', pdfFile); // key must match Laravel's expected input
        }

        // Replace console.log(formData) with:
        console.log('FormData values:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}:`, value);
        }

        router.post(route('expenses.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setShowModal(false);
                toast.success(`Union Expenses`, {
                    description: `New expense has been recorded and is waiting for approval.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2000,
                });
                setIsSaving(false);
                reset();
            },
            onError: (errors) => {
                console.error('Failed to add new expenses:', errors);
                setIsSaving(false);
            },
        });
    };

    const handleAction = (id: number, status: 'Approved' | 'Rejected' | 'Canceled', remarks: string = '') => {
        if (status === 'Rejected' && remarks === '') {
            toast.error('Remarks are required when rejecting an expense.');
            return;
        }
        if (status === 'Approved') {
            setIsApproved(true);
        } else if (status === 'Rejected') {
            setIsRejected(true);
        }
        if (status === 'Canceled') {
            setIsCanceled(true);
        }

        console.log(remarks);

        router.post(
            route('expenses.updateStatus'),
            { id, status, remarks },
            {
                onSuccess: () => {
                    if (status === 'Approved') {
                        toast.success(`Union Expenses`, {
                            description: `Expenses has been Approved.`,
                            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                            duration: 2000,
                        });
                        setIsApproved(false);
                    } else if (status === 'Rejected') {
                        toast.success(`Union Expenses`, {
                            description: `Expenses has been Rejected.`,
                            icon: <CircleX className="h-5 w-5 text-red-500" />,
                            duration: 2000,
                        });
                        setIsRejected(false);
                    }
                    if (status === 'Canceled') {
                        toast.success(`Union Expenses`, {
                            description: `Expenses has been Canceled.`,
                            icon: <X className="h-5 w-5 text-black" />,
                            duration: 2000,
                        });
                        setIsCanceled(false);
                    }
                    setIsViewModalOpen(false);
                    setRemarks('');
                    setSelectedExpense(null);
                },
                onError: (error) => {
                    toast.error(`Failed to update expense status` + error);
                },
            },
        );
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Disbursements" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title={title} description={description} />
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <Input
                                    placeholder="Search by Payee"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        fetchExpenses(value, selectedStatus);
                                    }}
                                    className="w-full md:max-w-sm"
                                />
                                {/* <Select
                                    onValueChange={(value) => {
                                        setSelectedStatus(value);
                                        fetchExpenses(searchTerm, value);
                                    }}
                                    value={selectedStatus}
                                >
                                    <SelectTrigger className="w-full md:max-w-sm">
                                        <SelectValue placeholder="Filter by Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Canceled">Canceled</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select> */}

                                <Button
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSelectedStatus('');
                                        setSearchTerm('');
                                        fetchExpenses('', '');
                                    }}
                                >
                                    <FaRedo className="mr-2" /> {/* Refresh Icon */}
                                    Reset
                                </Button>

                                {/* Payment button positioned at the end */}
                                {auth.user.role === 'Treasurer' && !filteredStatus && (
                                    <Button
                                        className="ml-auto cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                        onClick={() => setShowModal(true)}
                                    >
                                        <CreditCard className="mr-2" />
                                        New Disbursements
                                    </Button>
                                )}
                            </div>

                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('payee')}
                                            >
                                                Payee
                                                {sortBy === 'payee' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('check')}
                                            >
                                                Check No.
                                                {sortBy === 'check' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('name')}
                                            >
                                                Disbursements
                                                {sortBy === 'name' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('created_at')}
                                            >
                                                Created Date
                                                {sortBy === 'created_at' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('spent_at')}
                                            >
                                                Transaction Date
                                                {sortBy === 'spent_at' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                            {/* <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('status')}
                                            >
                                                Status
                                                {sortBy === 'status' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead> */}
                                            <TableHead className="text-sm tracking-wider text-white dark:text-gray-300">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {expenses.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-8 text-center text-sm text-gray-500">
                                                    No {title}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            expenses.data.map((due) => (
                                                <TableRow key={due.id}>
                                                    <TableCell className="break-words whitespace-normal">{due.payee}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{due.check}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{due.name}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{formatDate(due.created_at)}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{formatDate(due.spent_at)}</TableCell>
                                                    <TableCell className="break-words whitespace-normal text-red-500">
                                                        ₱ {Number(due.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                    {/* <TableCell className="text-center">
                                                        <Badge
                                                            className={
                                                                due.status === 'Approved'
                                                                    ? 'bg-green-500 text-white'
                                                                    : due.status === 'Rejected'
                                                                        ? 'bg-red-500 text-white'
                                                                        : due.status === 'Canceled'
                                                                            ? 'bg-black text-white'
                                                                            : 'bg-gray-300 text-black' // Pending or default
                                                            }
                                                        >
                                                            {due.status.charAt(0).toUpperCase() + due.status.slice(1)}
                                                        </Badge>
                                                    </TableCell> */}
                                                    <TableCell className="px-6 py-4 text-center break-words whitespace-normal">
                                                        <TooltipProvider>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="cursor-pointer text-blue-600 transition-colors duration-200 hover:bg-blue-600 hover:text-white"
                                                                            onClick={() => {
                                                                                setSelectedExpense(due);
                                                                                setRemarks(due.remarks ?? '');
                                                                                setIsViewModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <Eye className="h-5 w-5" />
                                                                            <span className="sr-only">View Disbursements</span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" align="center">
                                                                        View Disbursements
                                                                    </TooltipContent>
                                                                </Tooltip>

                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="cursor-pointer text-red-600 transition-colors duration-200 hover:bg-red-600 hover:text-white"
                                                                            onClick={() => {
                                                                                setSelectedExpense(due);
                                                                                setDeleteDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <Trash className="h-5 w-5" />
                                                                            <span className="sr-only">Delete Disbursements</span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" align="center">
                                                                        Delete Disbursements
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Controls */}
                            {expenses && expenses.links && expenses.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {expenses.links.map((link, index) => (
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
                            <DialogTitle>Add New Disbursements</DialogTitle>
                            <DialogDescription>Enter details about this disbursements.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Purpose
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Expenses"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            {/* Payee */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="payee" className="text-right">
                                    Payee
                                </Label>
                                <Input
                                    id="payee"
                                    placeholder="e.g. Juan Dela Cruz"
                                    value={data.payee}
                                    onChange={(e) => setData('payee', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>

                            {/* Check No */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="check_no" className="text-right">
                                    Check No.
                                </Label>
                                <Input
                                    id="check"
                                    placeholder="e.g. 0012345"
                                    value={data.check}
                                    onChange={(e) => setData('check', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="col-span-1 text-right">
                                    Amount
                                </Label>
                                <div className="relative col-span-3 w-full">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">₱</span>
                                    <Input
                                        id="amount"
                                        placeholder="Amount"
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="w-full pl-8" // ensures full width and padding for the ₱
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="spent_at" className="text-right">
                                    Transaction Date
                                </Label>
                                <Input
                                    id="spent_at"
                                    type="date"
                                    value={data.spent_at}
                                    onChange={(e) => setData('spent_at', e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div>
                                <div className="grid gap-2">
                                    <Label>Attach PDF File</Label>
                                    <div
                                        {...getRootProps()}
                                        className={`w-full rounded-lg border-2 border-dashed p-6 text-sm transition ${
                                            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                        }`}
                                    >
                                        <input {...getInputProps()} />
                                        {isDragActive ? (
                                            <p className="text-center text-blue-500">Drop your PDF here…</p>
                                        ) : (
                                            <p className="text-center text-gray-500">Drag & drop or click to select</p>
                                        )}
                                    </div>
                                    {pdfFile && <p className="mt-1 text-sm text-green-600">Uploaded: {pdfFile.name}</p>}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="hover:bg-red-500 hover:text-white" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                            >
                                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {isViewModalOpen && selectedExpense && (
                    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Disbursements Details</DialogTitle>
                                <DialogDescription>Full details of the disbursement record.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Table className="w-full">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="font-medium">Name</TableCell>
                                            <TableCell>{selectedExpense.name}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Payee</TableCell>
                                            <TableCell>{selectedExpense.payee}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Check No.</TableCell>
                                            <TableCell>{selectedExpense.check}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Description</TableCell>
                                            <TableCell className="break-words whitespace-pre-line">{selectedExpense.description}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Amount</TableCell>
                                            <TableCell className="text-red-500">
                                                ₱ {Number(selectedExpense.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Created Date</TableCell>
                                            <TableCell>{formatDate(selectedExpense.created_at)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Transaction Date</TableCell>
                                            <TableCell>{formatDate(selectedExpense.spent_at)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Status</TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        selectedExpense.status === 'Approved'
                                                            ? 'bg-green-500 text-white'
                                                            : selectedExpense.status === 'Rejected'
                                                              ? 'bg-red-500 text-white'
                                                              : selectedExpense.status === 'Canceled'
                                                                ? 'bg-black text-white'
                                                                : 'bg-gray-300 text-black' // Pending or default
                                                    }
                                                >
                                                    {selectedExpense.status.charAt(0).toUpperCase() + selectedExpense.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Creator</TableCell>
                                            <TableCell>
                                                {selectedExpense.user.given_name} {selectedExpense.user.middle_name} {selectedExpense.user.last_name}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Supporting Document</TableCell>
                                            <TableCell>
                                                {selectedExpense.documents ? (
                                                    <a
                                                        href={`/storage/${selectedExpense.documents}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        View Uploaded PDF
                                                    </a>
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">No document uploaded.</p>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell className="font-medium">Remarks</TableCell>
                                            <TableCell>
                                                <Textarea
                                                    className="mt-4"
                                                    value={remarks ?? ''}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    placeholder="Enter remarks (optional)"
                                                    disabled={selectedExpense.status != 'Pending'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="mt-6 flex items-center justify-between gap-2">
                                <div className="flex gap-2">
                                    {auth.user.role === 'Treasurer' && selectedExpense.status === 'Pending' && (
                                        <Button
                                            disabled={isCanceled}
                                            className="cursor-pointer bg-black text-white hover:bg-gray-800"
                                            onClick={() => handleAction(selectedExpense.id, 'Canceled', remarks)}
                                        >
                                            {isCanceled ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <X className="h-5 w-5" />}
                                            Cancel Disbursements
                                        </Button>
                                    )}
                                    {auth.user.role === 'President' && selectedExpense.status === 'Pending' && (
                                        <>
                                            <Button
                                                disabled={isApproved}
                                                className="cursor-pointer bg-green-600 text-white hover:bg-green-700"
                                                onClick={() => handleAction(selectedExpense.id, 'Approved', remarks)}
                                            >
                                                {isApproved ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                                Approve Disbursements
                                            </Button>
                                            <Button
                                                disabled={isRejected}
                                                className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                                                onClick={() => handleAction(selectedExpense.id, 'Rejected', remarks)}
                                            >
                                                {isRejected ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CircleX className="h-5 w-5" />}
                                                Reject Disbursements
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
                {deleteDialogOpen && selectedExpense && (
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Delete Disbursement</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this disbursement? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className={`flex items-center gap-2 ${isDeleting ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    disabled={isDeleting}
                                    onClick={async () => {
                                        if (!selectedExpense) return;
                                        setIsDeleting(true);

                                        if (!selectedExpense) return;

                                        router.delete(route('expenses.destroy', selectedExpense.id), {
                                            onSuccess: () => {
                                                toast.success('Disbursement deleted successfully', {
                                                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                                                });
                                                setDeleteDialogOpen(false);
                                            },
                                            onError: (errors) => {
                                                toast.error('Failed to delete disbursement', {
                                                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                                                    description: Object.values(errors).flat().join(', '),
                                                });
                                                console.error(errors);
                                            },
                                            onFinish: () => {
                                                setIsDeleting(false);
                                            },
                                        });
                                    }}
                                >
                                    {isDeleting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </AppLayout>
        </>
    );
}
