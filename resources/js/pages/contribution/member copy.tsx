import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface Contribution {
    id: number;
    month: string;
    year: string;
    amount: string;
    status: string;
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

export default function Member({ contribution }: ContributionProps) {
    const [selectedYear, setSelectedYear] = useState<string>('all');
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

    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(contribution.map((c) => c.year)));
        return uniqueYears.sort((a, b) => parseInt(b) - parseInt(a)); // Descending
    }, [contribution]);

    const filteredContributions = useMemo(() => {
        return selectedYear === 'all' ? contribution : contribution.filter((c) => c.year === selectedYear);
    }, [contribution, selectedYear]);

    const sortedContributions = useMemo(() => {
        const paid = [...filteredContributions].filter((c) => c.status === 'Paid');
        paid.sort((a, b) => {
            if (b.year !== a.year) return Number(b.year) - Number(a.year);
            return Number(b.month) - Number(a.month);
        });
        return paid;
    }, [filteredContributions]);

    const latestPaidContribution = sortedContributions[0];

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
                                                <TableHead className="px-3 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase">
                                                    Month
                                                </TableHead>
                                                <TableHead className="px-3 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase">
                                                    Year
                                                </TableHead>
                                                <TableHead className="px-3 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="px-3 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase">
                                                    Status
                                                </TableHead>
                                                <TableHead className="px-3 py-3 text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase">
                                                    Date Paid
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredContributions.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-muted-foreground px-4 py-6 text-center">
                                                        No contributions found for selected year.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredContributions
                                                    .sort((a, b) => {
                                                        if (b.year !== a.year) return Number(b.year) - Number(a.year);
                                                        return Number(b.month) - Number(a.month);
                                                    })
                                                    .map((item, index) => {
                                                        const isLatest = item === latestPaidContribution;
                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                className={isLatest ? 'bg-green-50 font-medium dark:bg-green-900/10' : ''}
                                                            >
                                                                <TableCell className="px-4 py-3">{getMonthName(item.month)}</TableCell>
                                                                <TableCell className="px-4 py-3">{item.year}</TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    ₱ {Number(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge
                                                                        className={
                                                                            item.status === 'Paid'
                                                                                ? 'bg-green-500 text-white'
                                                                                : 'bg-red-500 text-white'
                                                                        }
                                                                    >
                                                                        {item.status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    })}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
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

function getMonthName(month: string | number): string {
    const monthIndex = parseInt(month.toString()) - 1;
    const date = new Date(2000, monthIndex); // year doesn't matter
    return date.toLocaleString('default', { month: 'long' });
}
