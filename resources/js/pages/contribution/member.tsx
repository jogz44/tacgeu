import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { BadgeCheck, CalendarDays } from 'lucide-react';

interface Contribution {
    id: number;
    month: string; // "1" - "12"
    year: string;
    amount: string;
    status: string; // "Paid" | "Unpaid"
    created_at: string;
}

interface ContributionProps {
    contribution: Contribution[];
}

const breadcrumbs = [
    {
        title: 'Contribution',
        href: 'member/contributions',
    },
];

// Months for header
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Member({ contribution }: ContributionProps) {
    const [selectedYear, setSelectedYear] = useState<string>('all');

    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(contribution.map((c) => c.year)));
        return uniqueYears.sort((a, b) => parseInt(b) - parseInt(a));
    }, [contribution]);

    const filteredContributions = useMemo(() => {
        return selectedYear === 'all' ? contribution : contribution.filter((c) => c.year === selectedYear);
    }, [contribution, selectedYear]);

    // Group contributions by year
    const contributionsByYear = useMemo(() => {
        const grouped: Record<string, { year: string; months: Record<number, Contribution> }> = {};
        filteredContributions.forEach((item) => {
            if (!grouped[item.year]) {
                grouped[item.year] = { year: item.year, months: {} };
            }
            grouped[item.year].months[parseInt(item.month)] = item;
        });
        return Object.values(grouped).sort((a, b) => Number(b.year) - Number(a.year));
    }, [filteredContributions]);

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Monthly Contribution" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title="Monthly Contribution" description="Records of monthly contributions made by members as part of TACGEU." />

                            {/* Year Filter */}
                            <div className="max-w-xs">
                                <Select onValueChange={setSelectedYear} defaultValue="all">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {years.map((year) => (
                                            <SelectItem key={year} value={year}>
                                                {year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Table */}
                            <div className="mt-6 space-y-10">
                                <div className="mt-6">
                                    <Table className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
                                        <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                            <TableRow>
                                                <TableHead className="px-3 py-3 text-xs font-medium tracking-wider text-white uppercase">
                                                    Year
                                                </TableHead>
                                                {MONTHS.map((m) => (
                                                    <TableHead
                                                        key={m}
                                                        className="px-3 py-3 text-xs font-medium tracking-wider text-white uppercase text-center"
                                                    >
                                                        {m}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {contributionsByYear.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={13} className="text-muted-foreground px-4 py-6 text-center">
                                                        No contributions found for selected year.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                contributionsByYear.map((yearData, idx) => (
                                                    <TableRow key={idx}>
                                                        {/* Year */}
                                                        <TableCell className="px-4 py-3 font-medium">{yearData.year}</TableCell>

                                                        {/* Months */}
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                                                            const monthData = yearData.months[m];
                                                            return (
                                                                <TableCell key={m} className="px-2 py-3 text-center">
                                                                    {monthData ? (
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <div className="flex justify-center">
                                                                                    <Badge
                                                                                        className={
                                                                                            monthData.status === "Paid"
                                                                                                ? "bg-green-500 text-white cursor-pointer"
                                                                                                : "bg-red-500 text-white cursor-pointer"
                                                                                        }
                                                                                    >
                                                                                        ₱{" "}
                                                                                        {Number(monthData.amount).toLocaleString("en-PH", {
                                                                                            minimumFractionDigits: 2,
                                                                                        })}
                                                                                    </Badge>
                                                                                </div>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className="w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                                                                                <div className="flex flex-col gap-2">
                                                                                    {/* Date Section */}
                                                                                    <div className="flex items-center gap-2">
                                                                                        <CalendarDays className="h-4 w-4 text-emerald-500" />
                                                                                        <div className="flex flex-col">
                                                                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Date Paid</span>
                                                                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                                                                {new Date(monthData.created_at).toLocaleDateString("en-US", {
                                                                                                    year: "numeric",
                                                                                                    month: "long",
                                                                                                    day: "numeric",
                                                                                                })}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Status Section */}
                                                                                    <div className="flex items-center gap-2">
                                                                                        <BadgeCheck
                                                                                            className={`h-4 w-4 ${monthData.status === "Approved"
                                                                                                ? "text-green-500"
                                                                                                : monthData.status === "Rejected"
                                                                                                    ? "text-red-500"
                                                                                                    : "text-gray-500"
                                                                                                }`}
                                                                                        />
                                                                                        <div className="flex flex-col">
                                                                                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status</span>
                                                                                            <span
                                                                                                className={`text-sm font-medium ${monthData.status === "Approved"
                                                                                                    ? "text-green-600 dark:text-green-400"
                                                                                                    : monthData.status === "Rejected"
                                                                                                        ? "text-red-600 dark:text-red-400"
                                                                                                        : "text-gray-700 dark:text-gray-300"
                                                                                                    }`}
                                                                                            >
                                                                                                {monthData.status}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    ) : (
                                                                        <span className="text-red-500">—</span>
                                                                    )}
                                                                </TableCell>

                                                            );
                                                        })}
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
            </AppLayout>
        </>
    );
}
