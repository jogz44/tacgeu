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
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/date';
import { type BreadcrumbItem } from '@/types';
import { Inertia } from '@inertiajs/inertia';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, CheckCircle, CheckCircle2, CircleCheck, CircleX, HandCoins, LoaderCircle, Pencil, Trash2, Upload } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useRef, useState } from 'react';
import { FaRedo } from 'react-icons/fa';
import { toast } from 'sonner';
import ExportPDF from '../report/pdf/ExportPDF';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import * as XLSX from "xlsx";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Contribution',
        href: '/tacgeu/monthly/contribution',
    },
];

interface User {
    id: number;
    last_name: string;
    given_name: string;
    middle_name: string;
    suffix: string;
    nickname: string;
    address: string;
    contact_number: string;
    email: string;

    birth_month: string;
    birth_day: string;
    birth_year: string;
    birthplace: string;
    sex: string;
    civil_status: string;
    spouse_name: string;
    religion: string;

    education: string;
    college_degree: string;
    postgrad_degree: string;

    employment_status: string;
    position: string;
    salary_grade: string;
    office: string;

    physically_challenged: boolean;
    solo_parent: boolean;
    adoptive_couple: boolean;
    role: String;
}

export default function contribution() {
    const page = usePage<{
        contribution?: ContributionPageProps['contribution'];
        export?: Contribution[];
    }>();
    const { auth } = usePage().props as any;
    const contribution = page.props.contribution;
    const exportData = page.props.export ?? [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredDues, setFilteredDues] = useState<Contribution[]>([]);
    const [open, setOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const users: User[] = (usePage().props.users as User[]) || [];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);
    const { availableYears } = usePage().props;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [csvPreview, setCsvPreview] = useState<any[]>([]);
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [history, setHistory] = useState<Record<string, any[]>>({});
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContributionId, setEditingContributionId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedContributionId, setSelectedContributionId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 🔥 Grand Total (Amount column)
    const grandTotal = exportData.reduce((sum: number, item: any) => {
        return sum + Number(item.amount || 0);
    }, 0);

    const formatCurrency = (amount: number) => {
        return `₱ ${amount.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
        })}`;
    };

    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // ✅ use 12-hour format with AM/PM
    };

    const fullName = [
        auth.user.given_name,
        auth.user.middle_name,
        auth.user.last_name,
        auth.user.suffix,
    ]
        .filter(Boolean)
        .join(" ");

    const generatedDate = today.toLocaleString("en-US", options);

    // Define the Contribution interface
    interface Contribution {
        id: number;
        user: User;
        month: string;
        year: string;
        amount: string;
        status: string;
        created_at: string;
    }

    interface ContributionPageProps {
        contribution: {
            data: Contribution[];
            current_page: number;
            last_page: number;
            links: {
                url: string | null;
                label: string;
                active: boolean;
            }[];
        };
    }

    const fetchContribution = (search = '', month = '', year = '') => {
        router.get(
            '/tacgeu/monthly/contribution',
            {
                search,
                month,
                year,
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
            '/tacgeu/monthly/contribution',
            {
                search: searchTerm,
                year: selectedYear,
                month: selectedMonth,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Customize the number of items per page

    // Calculate the index range for the current page
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentDues = filteredDues.slice(indexOfFirstUser, indexOfLastUser);

    const { data, setData, post, processing, reset } = useForm({
        user_id: '',
        month: '',
        year: '',
        amount: '',
    });
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const handleSavePayment = () => {
        if (!data.user_id || !data.month || !data.year || !data.amount) {
            toast.error('Please fill all required fields');
            return;
        }
        if (isEditing && editingContributionId) {
            // Update existing contribution
            router.put(
                route('contribution.update', editingContributionId),
                data,
                {
                    onSuccess: () => {
                        toast.success('Contribution updated successfully', {
                            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        });
                        resetDialog();
                    },
                    onError: (errors) => {
                        toast.error('Failed to update contribution', {
                            icon: <CircleX className="h-5 w-5 text-red-500" />,
                            description: Object.values(errors).flat().join(', '),
                        });
                        console.error(errors);
                    },
                }
            );
        } else {
            post(route('contribution.store'), {
                onSuccess: () => {
                    setOpen(false);
                    toast.success(`Message`, {
                        description: `New contribution has been recorded.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 2500,
                    });
                    reset();
                    setUserSearch('');
                },
                onError: (errors) => {
                    toast.error(`Error`, {
                        description: Object.values(errors).flat().join('\n'),
                        icon: <CircleX className="h-5 w-5 text-red-500" />,
                        duration: 3500,
                    });
                    console.error('Failed to add new contribution:', errors);
                },
            });
        }
    };

    const resetDialog = () => {
        setOpen(false);
        setIsEditing(false);
        setEditingContributionId(null);
        setUserSearch('');
        reset();
    };

    // When opening dialog for editing
    const openEditDialog = (due: Contribution) => {
        setIsEditing(true);
        setEditingContributionId(due.id);
        setOpen(true);

        setUserSearch(
            `${due.user.given_name} ${due.user.middle_name ?? ''} ${due.user.last_name}`
        );
        setData({
            user_id: due.user.id.toString(),
            month: due.month,
            year: due.year,
            amount: due.amount?.toString(),
        });
    };

    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                setCsvPreview(results.data);
                setCsvDialogOpen(true); // open dialog after parse
            },
        });

        e.target.value = '';
    };

    const triggerCsvUpload = () => {
        fileInputRef.current?.click();
    };

    const handleSelectUser = (user: User) => {
        const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`;
        setUserSearch(fullName);
        setData((prev) => ({ ...prev, user_id: user.id.toString() }));
        setShowDropdown(false);

        // Fetch contributions
        setLoadingHistory(true);
        fetch(`/members/${user.id}/contributions`)
            .then((res) => res.json())
            .then((data) => {
                setHistory({ [user.id]: data });
            })
            .finally(() => setLoadingHistory(false));

    };

    interface Month {
        value: string;
        label: string;
    }

    function exportToExcel(
        exportData: Contribution[],
        months: Month[],
        fullName: string,
        grandTotal: number,
        colHeaders: string[],
        title: string = "Members Contribution"
    ) {
        // 1️⃣ Build data rows
        const dataRows = exportData?.map((due) => [
            // Full name
            [due.user.given_name, due.user.middle_name, due.user.last_name, due.user.suffix]
                .filter(Boolean)
                .join(" "),
            // Month label
            months.find((m) => m.value === String(due.month))?.label || "Invalid Month",
            // Year
            due.year,
            // Amount with peso sign
            `₱ ${Number(due.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
            // Date created
            formatDate(due.created_at),
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
        XLSX.utils.book_append_sheet(wb, ws, "Members Contribution");

        // 5️⃣ Export file
        XLSX.writeFile(wb, "Members_Contribution.xlsx");
    }

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="w-full px-0 sm:px-2 md:px-4"></div>
                <Head title="Members Contribution" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading
                                title="Members Contribution"
                                description="Records of monthly financial contributions made by union members as part of their membership dues or fees."
                            />
                            <div className="flex flex-col gap-4">
                                {/* === Top Row (Action Buttons Right) === */}
                                <div className="flex justify-end gap-2">
                                    <Button
                                        className="cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                        onClick={() => {
                                            resetDialog()
                                            setOpen(true)
                                        }
                                        }
                                    >
                                        <HandCoins className="mr-2" />
                                        Contribution
                                    </Button>

                                    {/* Hidden File Input */}
                                    <input
                                        type="file"
                                        accept=".csv"
                                        ref={fileInputRef}
                                        onChange={handleCsvUpload}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        onClick={triggerCsvUpload}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <Upload className="mr-2" />
                                        Upload CSV
                                    </Button>

                                    <ExportPDF
                                        data={
                                            exportData?.map((due) => [
                                                // ✅ Safely build full name (skips null/empty parts)
                                                [due.user.given_name, due.user.middle_name, due.user.last_name, due.user.suffix]
                                                    .filter(Boolean)
                                                    .join(" "),

                                                months.find((m) => m.value === String(due.month))?.label || "Invalid Month",
                                                due.year,
                                                // Amount with peso sign
                                                `P ${due.amount}`,
                                                formatDate(due.created_at),
                                            ]) ?? []
                                        }
                                        title="Members Contribution"
                                        subTitle=""
                                        colHeaders={["Name", "Month", "Year", "Amount", "Date Created"]}
                                        preparedBy={fullName}
                                        role={auth.user.role}
                                        grandTotal={grandTotal.toString()}
                                    />
                                    <Button className='bg-yellow-600 hover:bg-yellow-800 text-white shadow-md cursor-pointer'
                                        onClick={() => exportToExcel(exportData, months, fullName, grandTotal, ["Name", "Month", "Year", "Amount", "Date Created"])}
                                    >
                                        Export Excel
                                    </Button>
                                </div>

                                {/* === Filters Row === */}
                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                    <div className="flex w-full flex-col">
                                        <Input
                                            placeholder="Search by Name"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearchTerm(value);
                                                fetchContribution(value, selectedMonth, selectedYear);
                                            }}
                                            className="w-full"
                                        />
                                    </div>


                                    {/* Month Dropdown */}
                                    <div className="flex w-full flex-col md:w-2/5">
                                        <Select
                                            onValueChange={(value) => {
                                                setSelectedMonth(value);
                                                fetchContribution(searchTerm, value, selectedYear);
                                            }}
                                            value={selectedMonth}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {months.map((month) => (
                                                    <SelectItem key={month.value} value={month.value}>
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Year Dropdown */}
                                    <div className="flex w-full flex-col md:w-2/5">
                                        <Select
                                            onValueChange={(value) => {
                                                setSelectedYear(value);
                                                fetchContribution(searchTerm, selectedMonth, value);
                                            }}
                                            value={selectedYear}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(availableYears as number[]).map((year) => (
                                                    <SelectItem key={year} value={String(year)}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setSelectedMonth('');
                                            setSelectedYear('');
                                            setSearchTerm('');
                                            fetchContribution('', '');
                                        }}
                                    >
                                        <FaRedo className="mr-2" /> {/* Refresh Icon */}
                                        Reset
                                    </Button>
                                </div>
                            </div>


                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('given_name')}
                                            >
                                                Name
                                                {sortBy === 'given_name' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('month')}
                                            >
                                                Month
                                                {sortBy === 'month' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('year')}
                                            >
                                                Year
                                                {sortBy === 'year' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                                className="cursor-pointer text-sm tracking-wider text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"

                                            >
                                                Action
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {contribution?.data.map((due) => (
                                            <TableRow key={due.id}>
                                                <TableCell className="px-3 py-2">
                                                    {due.user.given_name} {due.user.middle_name} {due.user.last_name} {due.user.suffix}
                                                </TableCell>
                                                <TableCell>{months.find((m) => m.value === String(due.month))?.label || 'Invalid Month'}</TableCell>
                                                <TableCell>{due.year}</TableCell>
                                                <TableCell className="text-green-500">
                                                    ₱ {Number(due.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>{formatDate(due.created_at)}</TableCell>
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

                                                                        if (!due.user) return;
                                                                        setOpen(true);
                                                                        setIsEditing(true);
                                                                        setEditingContributionId(due.id);
                                                                        setUserSearch(
                                                                            `${due.user.given_name} ${due.user.middle_name ?? ''} ${due.user.last_name}`
                                                                        );
                                                                        setData({
                                                                            user_id: due.user.id.toString(),
                                                                            month: due.month.toString(),
                                                                            year: due.year.toString(),
                                                                            amount: due.amount?.toString(),
                                                                        });
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" align="center">
                                                                Edit Contribution
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
                                                                        setSelectedContributionId(due.id);
                                                                        setDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" align="center">
                                                                Delete Contribution
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Grand Total */}
                            <div className="flex justify-end mt-4">
                                <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 px-6 py-3 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Grand Total
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                        ₱ {grandTotal.toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </div>
                            {/* Pagination Controls */}
                            {contribution && contribution.links && contribution.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {contribution.links.map((link, index) => (
                                            <PaginationItem key={index}>
                                                &nbsp;
                                                {link.url ? (
                                                    <PaginationLink
                                                        onClick={() => router.visit(link.url!)}
                                                        isActive={link.active}
                                                        className={`mx-2 ${link.active ? 'bg-gray-200 dark:bg-gray-700' : ''} cursor-pointer`}
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
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogContent
                        className="max-h-[90vh] !max-w-7xl overflow-y-auto">
                        {/* HEADER */}
                        <DialogHeader className="pb-4 border-b dark:border-gray-700">
                            <DialogTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                                New Monthly Contribution
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                                Fill in the payment details and review the member’s contribution history.
                            </DialogDescription>
                        </DialogHeader>

                        {/* BODY */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_2fr] py-4">
                            {/* LEFT SIDE: Form */}
                            <div className="space-y-5 pr-2">
                                {/* Member Search */}
                                <div className="relative flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Select Member <span className="text-red-500">*</span>
                                    </label>
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
                                    {/* Dropdown */}
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
                                                            const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`;
                                                            return (
                                                                <li
                                                                    key={user.id}
                                                                    onClick={() => handleSelectUser(user)}
                                                                    className="cursor-pointer px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                >
                                                                    {fullName}
                                                                </li>
                                                            );
                                                        })}
                                                </ul>
                                            ) : (
                                                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                                    No members found.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Month + Year */}
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="flex w-full flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Month <span className="text-red-500">*</span>
                                        </label>
                                        <Select value={data.month} onValueChange={(value) => setData('month', value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Month" />
                                            </SelectTrigger>
                                            <SelectContent className="h-80 p-0 text-sm">
                                                {months.map((month) => (
                                                    <SelectItem key={month.value} value={month.value}>
                                                        {month.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex w-full flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Year <span className="text-red-500">*</span>
                                        </label>
                                        <Select value={data.year} onValueChange={(value) => setData('year', value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent className="h-80 p-0 text-sm">
                                                {years.map((year) => (
                                                    <SelectItem key={year} value={String(year)}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="relative">
                                    <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Amount <span className="text-red-500">*</span>
                                    </label>
                                    <span className="absolute top-[30px] left-3 text-gray-500 dark:text-gray-400">₱</span>
                                    <Input
                                        required
                                        placeholder="Amount"
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="pl-8 w-full"
                                    />
                                </div>
                            </div>

                            {/* RIGHT SIDE: Contribution History */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40 w-full">
                                <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Contribution History
                                </h3>

                                {loadingHistory ? (
                                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                                ) : (
                                    <div className="w-full overflow-x-auto">
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <table className="min-w-[800px] border-collapse border text-sm">
                                                <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="border px-3 py-2 text-right w-20">Year</th>
                                                        {[
                                                            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                                            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                                        ].map((m) => (
                                                            <th
                                                                key={m}
                                                                className="border px-3 py-2 text-center font-medium"
                                                            >
                                                                {m}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.user_id && history[data.user_id] && history[data.user_id].length > 0 ? (
                                                        history[data.user_id].map((row: any, idx: number) => (
                                                            <tr
                                                                key={idx}
                                                                className={idx % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}
                                                            >
                                                                <td className="border px-3 py-2 text-right font-semibold">
                                                                    {row.year}
                                                                </td>
                                                                {[
                                                                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                                                                ].map((m) => (
                                                                    <td
                                                                        key={m}
                                                                        className="border px-3 py-2 text-center"
                                                                    >
                                                                        {row[m] === "Unpaid" ? (
                                                                            <div className="flex items-center justify-center gap-1 text-red-600">
                                                                                <CircleX size={16} className="stroke-[2.5]" />
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center justify-center gap-1 text-green-600">
                                                                                <span className="font-semibold">{row[m]}</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td
                                                                colSpan={13}
                                                                className="border px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                                                            >
                                                                No contributions found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <DialogFooter className="mt-4 border-t pt-4 dark:border-gray-700">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <Button
                                className="ml-auto cursor-pointer gap-2 rounded-lg bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                onClick={() => {
                                    setHasAttemptedSubmit(true);
                                    if (data.year) {
                                        handleSavePayment();
                                    }
                                }}
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-5 w-5" />
                                )}
                                Save Contribution
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
                    <DialogContent className="!w-[1200px] !max-w-none overflow-auto">
                        <DialogHeader>
                            <DialogTitle>CSV Preview</DialogTitle>
                            <DialogDescription>Check your data before submitting.</DialogDescription>
                        </DialogHeader>

                        {csvPreview.length > 0 ? (
                            <div className="mt-4 max-h-[400px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(csvPreview[0]).map((key) => (
                                                <TableHead key={key}>{key}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {csvPreview.map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(row).map((val, j) => (
                                                    <TableCell key={j}>{String(val)}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p>No data found in the CSV file.</p>
                        )}

                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                            {/* You can trigger backend insert here */}
                            <Button
                                onClick={() => {
                                    if (csvPreview.length === 0) return;

                                    Inertia.post(
                                        '/monthly/contribution/import',
                                        {
                                            data: csvPreview,
                                        },
                                        {
                                            onSuccess: (page) => {
                                                if (page.props.success) {
                                                    toast.success('Success', {
                                                        description: String(page.props.message),
                                                        icon: <CircleCheck className="h-5 w-5 text-red-500" />,
                                                        duration: 3500,
                                                    });
                                                }
                                                setCsvDialogOpen(false);
                                            },
                                            onError: (errors) => {
                                                console.error(errors);
                                                toast.error(`Error`, {
                                                    description: Object.values(errors).join(', '),
                                                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                                                    duration: 3500,
                                                });
                                            },
                                        },
                                    );
                                }}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                Submit
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete Contribution</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this contribution? This action cannot be undone.
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
                                    if (!selectedContributionId) return;
                                    setIsDeleting(true);

                                    router.delete(route('contribution.destroy', selectedContributionId), {
                                        onSuccess: () => {
                                            toast.success('Contribution deleted successfully', {
                                                icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                                            });
                                            setDeleteDialogOpen(false);
                                        },
                                        onError: (errors) => {
                                            toast.error('Failed to delete contribution', {
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
            </AppLayout>
        </>
    );
}
