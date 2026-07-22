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
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, CheckCircle, CircleX, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FaPlusCircle, FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import ExportPDF from '../report/pdf/ExportPDF';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/lib/date';
import { format, set } from "date-fns";
import * as XLSX from "xlsx";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Receipts',
        href: '/tacgeu/payments',
    },
];


export default function expenses() {
    const { payments } = usePage().props as unknown as PaymentPageProps;
    const { collections } = usePage().props as unknown as { collections: Collections[] };
    const { export: exportData } = usePage().props as unknown as { export: Payments[] };
    const [selectedCollection, setSelectedCollection] = useState<Collections | null>(null);
    const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string>('');
    const users: User[] = (usePage().props.users as User[]) || [];
    const [searchTerm, setSearchTerm] = useState('');
    const { auth } = usePage().props as any;
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [open, setOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
    const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);
    const [isDelete, setIsDelete] = useState(false);
    const [selectedDate, setSelectedDate] = useState(() =>
        format(new Date(), "yyyy-MM-dd")
    );

    const grandTotal = exportData.reduce((sum: number, item: any) => {
        return sum + Number(item.amount || 0);
    }, 0);

    const fullName = [
        auth.user.given_name,
        auth.user.middle_name,
        auth.user.last_name,
        auth.user.suffix,
    ]
        .filter(Boolean)
        .join(" ");

    // Define the Expenses interface
    interface Payments {
        id: number;
        user: User;
        collection: Collections;
        name: string;
        amount: string;
        created_at: string;
        collection_name: string;
        transaction_at: string;
    }

    interface Collections {
        id: number;
        name: string;
        description: string;
        amount: string;
        created_at: string;
    }

    interface PaymentPageProps {
        payments: {
            data: Payments[];
            current_page: number;
            last_page: number;
            links: {
                url: string | null;
                label: string;
                active: boolean;
            }[];
        };
    }

    const { data, setData, post, put, processing, reset } = useForm({
        user_id: '',
        collection_id: '',
        amount: '',
        transaction_at: selectedDate,
    });

    const fetchPayments = (search = '', transaction_at = '', collection_id = '') => {
        const effectiveDate = transaction_at || format(new Date(), "yyyy-MM-dd");

        router.get(
            '/tacgeu/payments',
            {
                search,
                collection_id,
                transaction_at: effectiveDate,
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
            '/tacgeu/payments',
            {
                search: searchTerm,
                transaction_at: selectedDate,
                collection_id: selectedCollectionFilter,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSavePayment = () => {
        const isUpdate = isEditing && editingPaymentId;
        setSaving(true);

        const endpoint = isUpdate ? route('payments.update', editingPaymentId) : route('payments.store');

        const method = isUpdate ? 'put' : 'post';

        const action = method === 'post' ? post : put;

        action(endpoint, {
            onSuccess: () => {
                setOpen(false);
                toast.success(`Receipts`, {
                    description: isUpdate ? `Payment has been updated.` : `Payment has been recorded.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2500,
                });
                reset(); // Clear form
                setUserSearch('');
                setIsEditing(false);
                setEditingPaymentId(null);
                setSaving(false);
            },
            onError: (errors) => {
                toast.error(`Receipts`, {
                    description: errors.user_id ?? 'Something went wrong.',
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 2500,
                });
                setSaving(false);
                console.error('Failed to add record Receipts:', errors);
            },
        });
    };

    const handleDelete = () => {
        if (!deletingPaymentId) return;
        setIsDelete(true);
        router.delete(route('payments.destroy', deletingPaymentId), {
            onSuccess: () => {
                setShowDeleteModal(false);
                toast.success('Receipts deleted', {
                    description: 'The receipt has been successfully deleted.',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2500,
                });
                setIsDelete(false);
                setDeletingPaymentId(null);
            },
            onError: (errors) => {
                toast.error('Delete failed', {
                    description: errors.error,
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 2500,
                });
                setIsDelete(true);
            },
        });
    };

    function exportReceiptsToExcel(
        exportData: Payments[],
        fullName: string,
        grandTotal: number,
        colHeaders: string[] = ["Name", "Collection", "Amount", "Date Created"],
        title: string = "Collections"
    ) {
        // 1️⃣ Build data rows
        const dataRows = exportData?.map((payment) => [
            // Full name
            [payment.user.given_name, payment.user.middle_name, payment.user.last_name, payment.user.suffix]
                .filter(Boolean)
                .join(" "),
            // Collection name
            payment.collection_name,
            // Amount with peso sign
            `₱${Number(payment.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
            // Date created
            formatDate(payment.created_at),
        ]) ?? [];

        // 2️⃣ Add Grand Total row under Amount column
        if (grandTotal != null) {
            const amountColIndex = colHeaders.findIndex((h) => h.toLowerCase() === "amount");
            const grandTotalRow = colHeaders.map((_, idx) =>
                idx === 0
                    ? "Grand Total"
                    : idx === amountColIndex
                        ? `₱${Number(grandTotal).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                        : ""
            );
            dataRows.push(grandTotalRow);
        }

        // 3️⃣ Add column headers
        const wsData = [
            [title],           // Title row
            [],                // Blank row
            colHeaders,        // Column headers
            ...dataRows,       // All data rows including Grand Total
            [],                // Blank row before Prepared By
            [`Prepared By: ${fullName}`] // Prepared By at the bottom
        ];
        // 4️⃣ Create worksheet & workbook
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Receipts");

        // 5️⃣ Export file
        XLSX.writeFile(wb, "Receipts.xlsx");
    }

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Receipts" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title="TACGEU Receipts" description="Records of all payment transaction by union members." />
                            <div className="flex flex-col gap-4">
                                {/* === Top Row (Action Buttons Right) === */}
                                <div className="flex justify-end gap-2">
                                    {/* New Payment Button */}
                                    <Button
                                        className="cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                        onClick={() => {
                                            setOpen(true);
                                            setIsEditing(false);
                                        }}
                                    >
                                        <FaPlusCircle className="mr-2" />
                                        New Receipts
                                    </Button>
                                    <ExportPDF
                                        data={
                                            exportData?.map((payment: { user: { given_name: any; middle_name: any; last_name: any; suffix: any; }; collection_name: any; amount: any; created_at: string; }) => [
                                                // ✅ Safely build full name (skips null/empty parts)
                                                [payment.user.given_name, payment.user.middle_name, payment.user.last_name, payment.user.suffix]
                                                    .filter(Boolean)
                                                    .join(" "),
                                                payment.collection_name,
                                                `P ${Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
                                                formatDate(payment.created_at),
                                            ]) ?? []
                                        }
                                        title={`${selectedCollectionFilter ? `${selectedCollectionFilter} Collections` : 'Collections'} - ${format(new Date(), "MMMM dd, yyyy")}`}
                                        subTitle=""
                                        colHeaders={["Name", "Collection", "Amount", "Create Date"]}
                                        preparedBy={fullName}
                                        role={auth.user.role}
                                        grandTotal={grandTotal.toString()}
                                    />
                                    <Button className='bg-yellow-600 hover:bg-yellow-800 text-white shadow-md cursor-pointer'
                                        onClick={() => exportReceiptsToExcel(exportData, fullName, grandTotal)}
                                    >
                                        Export Excel
                                    </Button>
                                </div>
                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                    <div className="flex w-full flex-col">
                                        {/* Search Input */}
                                        <Input
                                            placeholder="Search by name..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearchTerm(value);
                                                fetchPayments(value, selectedDate, selectedCollectionFilter);
                                            }}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="flex w-full flex-col md:w-2/5">
                                        <Select
                                            value={selectedCollectionFilter}
                                            onValueChange={(value) => {
                                                setSelectedCollectionFilter(value);
                                                fetchPayments(searchTerm, selectedDate, value);
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Filter by Collection" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {collections.map((collection) => (
                                                    <SelectItem key={collection.name} value={collection.name}>
                                                        {collection.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex w-full flex-col md:w-2/5">
                                        <div className="w-full">
                                            <Input
                                                type="date"
                                                value={selectedDate || format(new Date(), "yyyy-MM-dd")}
                                                onChange={(e) => {
                                                    const newDate = e.target.value || format(new Date(), "yyyy-MM-dd");
                                                    setSelectedDate(newDate);
                                                    fetchPayments(searchTerm, newDate, selectedCollectionFilter);
                                                }}
                                                className="cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Reset Button */}
                                    <Button
                                        className="cursor-pointer"
                                        onClick={() => {
                                            const today = format(new Date(), "yyyy-MM-dd");
                                            setSearchTerm('');
                                            setSelectedCollectionFilter('');
                                            setSelectedDate(today);
                                            fetchPayments('', today, '');
                                        }}
                                    >
                                        <FaRedo className="mr-2" />
                                        Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('users.given_name')}
                                            >
                                                Member
                                                {sortBy === 'users.given_name' &&
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
                                                Collection
                                                {sortBy === 'name' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
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
                                            <TableHead
                                                className="ttext-sm cursor-pointer text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('transaction_at')}
                                            >
                                                Transaction Date
                                                {sortBy === 'transaction_at' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="ttext-sm cursor-pointer text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                            <TableHead className="text-sm tracking-wider text-white dark:text-gray-300"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {payments.data.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell className="break-words whitespace-normal">
                                                    {payment.user.given_name} {payment.user.middle_name} {payment.user.last_name}
                                                </TableCell>
                                                <TableCell className="break-words whitespace-normal">{payment.collection_name}</TableCell>
                                                <TableCell className="break-words whitespace-normal text-red-500">
                                                    ₱ {Number(payment.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell className="break-words whitespace-normal">{formatDate(payment.transaction_at)}</TableCell>
                                                <TableCell className="break-words whitespace-normal">{formatDate(payment.created_at)}</TableCell>
                                                <TableCell className="flex gap-2">
                                                    <TooltipProvider>
                                                        {/* Edit Button */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        if (!payment.user) return; // avoid crash if user is missing
                                                                        setOpen(true);
                                                                        setIsEditing(true);
                                                                        setEditingPaymentId(payment.id);
                                                                        setUserSearch(
                                                                            `${payment.user.given_name} ${payment.user.middle_name ?? ''} ${payment.user.last_name}`
                                                                        );
                                                                        setData({
                                                                            user_id: payment.user.id.toString(),
                                                                            collection_id: payment.collection.id.toString(),
                                                                            amount: payment.amount?.toString(),
                                                                            transaction_at: payment.transaction_at,
                                                                        });
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" align="center">
                                                                Edit Receipts
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        {/* Delete Button */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setDeletingPaymentId(payment.id);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" align="center">
                                                                Delete Receipts
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Controls */}
                            {payments && payments.links && payments.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {payments.links.map((link, index) => (
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
                            <DialogTitle>{isEditing ? 'Update Payment' : 'New Payment'}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? 'Update the details for the payment transaction.' : 'Enter the details for the new payment transaction.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="relative flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Select Member</label>
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
                            <div className="space-y-4">
                                {/* Dropdown for Name of Payment */}
                                <div className="space-y-1">
                                    <label htmlFor="paymentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Name of Receipts
                                    </label>
                                    <Select
                                        value={data.collection_id}
                                        onValueChange={(value) => {
                                            const selected = collections.find((c) => c.id.toString() === value);
                                            if (selected) {
                                                setData('collection_id', selected.id.toString());
                                                setData('amount', selected.amount);
                                                setSelectedCollection(selected);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a payment name" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {collections.map((collection) => (
                                                <SelectItem key={collection.id} value={collection.id.toString()}>
                                                    {collection.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Auto-filled Amount Field */}
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">₱</span>
                                    <Input
                                        required
                                        placeholder="Amount"
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                {/* ✅ Transaction Date Field */}
                                <div className="space-y-1">
                                    <label
                                        htmlFor="transaction_at"
                                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Transaction Date
                                    </label>
                                    <Input
                                        required
                                        type="date"
                                        value={data.transaction_at || ""}
                                        onChange={(e) => setData("transaction_at", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {!data.user_id && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Member is required.</p>}
                        {!data.amount && hasAttemptedSubmit && <p className="mt-1 text-sm text-red-500">Amount is required.</p>}

                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setOpen(false);
                                        setIsEditing(false); // reset editing state
                                        setEditingPaymentId(null);
                                        setData({
                                            user_id: '',
                                            collection_id: '',
                                            amount: '',
                                            transaction_at: '',
                                        });
                                        setUserSearch('');
                                    }}
                                    className='bg-red-400 hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600 cursor-pointer'
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <Button
                                className="ml-auto cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                onClick={() => {
                                    setHasAttemptedSubmit(true);
                                    handleSavePayment();
                                }} // Change endpoint as needed
                                disabled={isSaving}
                            >
                                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                {isEditing ? 'Update Payment' : 'Save Payment'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Delete Button with modal trigger */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogDescription>Do you want to delete the Receipts?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button variant="destructive" onClick={handleDelete} disabled={isDelete} className="cursor-pointer">
                                {isDelete ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                Delete
                            </Button>
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout >
        </>
    );
}
