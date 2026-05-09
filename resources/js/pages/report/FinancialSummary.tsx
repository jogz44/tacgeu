import { Head, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Toaster } from 'sonner';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Wallet, PiggyBank, Receipt, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/lib/date';
import { format, set } from "date-fns";
import ExportFinancialPDF from './pdf/ExportFinancialPDF';
import ExportFinancialSummaryPDF from './pdf/ExportFinancialSummaryPDF';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Financial Summary', href: '/financial-summary' },
];

export default function FinancialSummary() {

    const { details = { collections: [], contributions: [], expenses: [] },
        totals = { collections: 0, contributions: 0, expenses: 0, net: 0 },
        start_date: serverStartDate,
        end_date: serverEndDate } = usePage().props as any;

    const todayStr = format(new Date(), "yyyy-MM-dd"); // date-fns format for input type="date"

    const { data, setData, get } = useForm({
        start_date: serverStartDate || todayStr,
        end_date: serverEndDate || todayStr,
    });

    const totalCollections = details.collections.reduce(
        (sum: number, item: any) => sum + Number(item.amount || 0),
        0
    );

    const totalContribution = details.contributions.reduce(
        (sum: number, item: any) => sum + Number(item.amount || 0),
        0
    );

    const totalExpenses = details.expenses.reduce(
        (sum: number, item: any) => sum + Number(item.amount || 0),
        0
    );

    const { auth } = usePage().props as any;

    const fullName = [
        auth.user.given_name,
        auth.user.middle_name,
        auth.user.last_name,
        auth.user.suffix,
    ]
        .filter(Boolean)
        .join(" ");

    const handleFilter = () => {
        get(route("financial.summary", {
            start_date: data.start_date,
            end_date: data.end_date,
        }), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Financial Summary" />
                <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl border py-6">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading
                                title="Financial Summary Report"
                                description="Analyze financial performance through detailed summaries of collections, contributions, and expenses over time."
                            />
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-muted-foreground">From:</label>
                                        <Input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData("start_date", e.target.value)}
                                            className="w-[160px]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-muted-foreground">To:</label>
                                        <Input
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData("end_date", e.target.value)}
                                            className="w-[160px]"
                                        />
                                    </div>

                                    <Button
                                        variant="default"
                                        onClick={handleFilter}
                                        disabled={!data.start_date || !data.end_date}
                                    >
                                        Filter
                                    </Button>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <ExportFinancialSummaryPDF
                                        collections={details.collections}
                                        contributions={details.contributions}
                                        expenses={details.expenses}
                                        totals={totals}
                                        preparedBy={fullName}
                                        startDate={new Date(data.start_date)}
                                        endDate={new Date(data.end_date)}
                                        role={auth.user.role}
                                    />
                                </div>

                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Total Collections */}
                                    <div className="cursor-pointer transform transition-all duration-300 hover:scale-105">
                                        <Card className="group hover:shadow-lg border-l-4 border-green-500 bg-gradient-to-br from-green-50 to-white">
                                            <CardHeader className="flex items-center gap-2">
                                                <Wallet className="text-green-600 group-hover:rotate-6 transition-transform duration-300" />
                                                <span className="font-semibold text-gray-700">Total Collections</span>
                                            </CardHeader>
                                            <CardContent className="text-2xl font-bold text-green-700">
                                                ₱ {totals.collections.toLocaleString()}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Total Contributions */}
                                    <div className="cursor-pointer transform transition-all duration-300 hover:scale-105">
                                        <Card className="group hover:shadow-lg border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-white">
                                            <CardHeader className="flex items-center gap-2">
                                                <PiggyBank className="text-blue-600 group-hover:rotate-6 transition-transform duration-300" />
                                                <span className="font-semibold text-gray-700">Total Contributions</span>
                                            </CardHeader>
                                            <CardContent className="text-2xl font-bold text-blue-700">
                                                ₱ {totals.contributions.toLocaleString()}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Total Expenses */}
                                    <div className="cursor-pointer transform transition-all duration-300 hover:scale-105">
                                        <Card className="group hover:shadow-lg border-l-4 border-red-500 bg-gradient-to-br from-red-50 to-white">
                                            <CardHeader className="flex items-center gap-2">
                                                <Receipt className="text-red-600 group-hover:rotate-6 transition-transform duration-300" />
                                                <span className="font-semibold text-gray-700">Total Expenses</span>
                                            </CardHeader>
                                            <CardContent className="text-2xl font-bold text-red-700">
                                                ₱ {totals.expenses.toLocaleString()}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Net Income */}
                                    <div className="cursor-pointer transform transition-all duration-300 hover:scale-105">
                                        <Card
                                            className={`group hover:shadow-lg border-l-4 ${totals.net < 0
                                                ? "border-red-500 bg-gradient-to-br from-red-50 to-white"
                                                : "border-emerald-500 bg-gradient-to-br from-emerald-50 to-white"
                                                }`}
                                        >
                                            <CardHeader className="flex items-center gap-2">
                                                <TrendingUp
                                                    className={`transition-transform duration-300 group-hover:rotate-6 ${totals.net < 0 ? "text-red-600" : "text-emerald-600"
                                                        }`}
                                                />
                                                <span className="font-semibold text-gray-700">Net Income</span>
                                            </CardHeader>
                                            <CardContent
                                                className={`text-2xl font-bold ${totals.net < 0 ? "text-red-700" : "text-emerald-700"
                                                    }`}
                                            >
                                                ₱ {totals.net.toLocaleString()}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Tabular Reports */}
                                <Tabs defaultValue="collections" className="mt-8">
                                    <TabsList className="flex gap-3 bg-white p-1">
                                        <TabsTrigger
                                            value="collections"
                                            className="data-[state=active]:bg-green-500 data-[state=active]:text-white hover:bg-green-100 text-green-600 font-semibold rounded-xl px-5 py-2 transition-all shadow-sm cursor-pointer"
                                        >
                                            💰 Collections
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="contributions"
                                            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-blue-100 text-blue-600 font-semibold rounded-xl px-5 py-2 transition-all shadow-sm cursor-pointer"
                                        >
                                            🙌 Contributions
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="expenses"
                                            className="data-[state=active]:bg-red-500 data-[state=active]:text-white hover:bg-red-100 text-red-600 font-semibold rounded-xl px-5 py-2 transition-all shadow-sm cursor-pointer"
                                        >
                                            💸 Expenses
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Collections Table */}
                                    <TabsContent value="collections">
                                        <div className="flex justify-end gap-2">
                                            <ExportFinancialPDF
                                                data={
                                                    details.collections.map((item: { user: { fullname: any; }; collection: { name: any; }; amount: any; created_at: string; }) => [
                                                        formatDate(item.created_at),
                                                        item.collection.name ?? "—",
                                                        item.user?.fullname ?? "—",
                                                        `P ${Number(item.amount).toLocaleString("en-PH", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`
                                                    ]) ?? []
                                                }
                                                title="Collection Records"
                                                subTitle=""
                                                colHeaders={["Date", "Collection", "Name", "Amount"]}
                                                preparedBy={fullName}
                                                startDate={data.start_date}
                                                endDate={data.end_date}
                                                role={auth.user.role}
                                            />
                                        </div>
                                        <div className="overflow-x-auto mt-6">
                                            <Table className="rounded-lg border border-border shadow-sm">
                                                <TableCaption>A summary of all collection records</TableCaption>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/60">
                                                        <TableHead className="font-semibold">Date</TableHead>
                                                        <TableHead className="font-semibold">Collection</TableHead>
                                                        <TableHead className="font-semibold">Member</TableHead>
                                                        <TableHead className="text-right font-semibold">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {details.collections.length > 0 ? (
                                                        details.collections.map((item: any) => (
                                                            <TableRow
                                                                key={item.id}
                                                                className="hover:bg-muted/40 transition-colors cursor-pointer"
                                                            >
                                                                <TableCell className="py-3">
                                                                    {formatDate(item.created_at)}
                                                                </TableCell>

                                                                <TableCell className="py-3 font-medium">
                                                                    {item.collection?.name ?? "—"}
                                                                </TableCell>

                                                                <TableCell className="py-3 text-muted-foreground">
                                                                    {item.user?.fullname ?? "—"}
                                                                </TableCell>

                                                                <TableCell className="py-3 text-right">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-green-50 border-green-400 text-green-700 text-sm px-3 py-1 font-semibold"
                                                                    >
                                                                        P {Number(item.amount).toLocaleString("en-PH", {
                                                                            minimumFractionDigits: 2,
                                                                            maximumFractionDigits: 2,
                                                                        })}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                                                No collection records found
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                                {/* ✅ Subtotal Row */}
                                                {details.collections.length > 0 && (
                                                    <TableFooter>
                                                        <TableRow className="bg-muted/40">
                                                            <TableCell colSpan={3} className="text-right font-semibold py-3">
                                                                Sub total
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-green-700 py-3">
                                                                P {totalCollections.toLocaleString("en-PH", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableFooter>
                                                )}
                                            </Table>
                                        </div>
                                    </TabsContent>

                                    {/* Contributions Table */}
                                    <TabsContent value="contributions">
                                        <div className="flex justify-end gap-2">
                                            <ExportFinancialPDF
                                                data={
                                                    details.contributions.map((item: { user: { fullname: any; }; collection: { name: any; }; month: any; year: any; amount: any; created_at: string; }) => [
                                                        formatDate(item.created_at),
                                                        item.user?.fullname ?? "—",
                                                        item.month,
                                                        item.year,
                                                        `P ${Number(item.amount).toLocaleString("en-PH", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`
                                                    ]) ?? []
                                                }
                                                title="Contribution Records"
                                                subTitle=""
                                                colHeaders={["Date", "Name", "Month", "Year", "Amount"]}
                                                preparedBy={fullName}
                                                startDate={data.start_date}
                                                endDate={data.end_date}
                                                role={auth.user.role}
                                            />
                                        </div>

                                        <div className="overflow-x-auto mt-6">
                                            <Table className="rounded-lg border border-border shadow-sm">
                                                <TableCaption>Summary of member contribution records</TableCaption>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/60">
                                                        <TableHead className="font-semibold">Date</TableHead>
                                                        <TableHead className="font-semibold">Member</TableHead>
                                                        <TableHead className="font-semibold">Month</TableHead>
                                                        <TableHead className="font-semibold">Year</TableHead>
                                                        <TableHead className="text-right font-semibold">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {details.contributions.length > 0 ? (
                                                        details.contributions.map((item: any) => (
                                                            <TableRow
                                                                key={item.id}
                                                                className="hover:bg-muted/40 transition-colors cursor-pointer"
                                                            >
                                                                <TableCell className="py-3">
                                                                    {formatDate(item.created_at)}
                                                                </TableCell>
                                                                <TableCell className="py-3 font-medium">
                                                                    {item.user?.fullname ?? "—"}
                                                                </TableCell>
                                                                <TableCell className="py-3">{item.month}</TableCell>
                                                                <TableCell className="py-3">{item.year}</TableCell>
                                                                <TableCell className="py-3 text-right">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-blue-50 border-blue-400 text-blue-700 text-sm px-3 py-1 font-semibold"
                                                                    >
                                                                        P {Number(item.amount).toLocaleString("en-PH", {
                                                                            minimumFractionDigits: 2,
                                                                            maximumFractionDigits: 2,
                                                                        })}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={5}
                                                                className="text-center py-6 text-muted-foreground"
                                                            >
                                                                No contribution records found
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                                {/* ✅ Subtotal Row */}
                                                {details.contributions.length > 0 && (
                                                    <TableFooter>
                                                        <TableRow className="bg-muted/40">
                                                            <TableCell colSpan={4} className="text-right font-semibold py-3">
                                                                Sub total
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-blue-700 py-3">
                                                                P {totalContribution.toLocaleString("en-PH", {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                })}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableFooter>
                                                )}
                                            </Table>
                                        </div>
                                    </TabsContent>

                                    {/* Expenses Table */}
                                    <TabsContent value="expenses">
                                        <div className="flex justify-end gap-2">
                                            <ExportFinancialPDF
                                                data={
                                                    details.expenses.map((item: { user: { fullname: any; }; name: any; description: any; amount: any; created_at: string; }) => [
                                                        formatDate(item.created_at),
                                                        item.name ?? "—",
                                                        item.description,
                                                        `P ${Number(item.amount).toLocaleString("en-PH", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}`
                                                    ]) ?? []
                                                }
                                                title="Expenses Records"
                                                subTitle=""
                                                colHeaders={["Date", "Name", "Description", "Amount"]}
                                                preparedBy={fullName}
                                                startDate={data.start_date}
                                                endDate={data.end_date}
                                                role={auth.user.role}
                                            />
                                        </div>
                                        <div className="overflow-x-auto mt-6">
                                            <Table className="rounded-lg border border-border shadow-sm">
                                                <TableCaption>List of all recorded expenses</TableCaption>

                                                <TableHeader>
                                                    <TableRow className="bg-muted/60">
                                                        <TableHead className="font-semibold">Date</TableHead>
                                                        <TableHead className="font-semibold">Name</TableHead>
                                                        <TableHead className="font-semibold">Description</TableHead>
                                                        <TableHead className="text-right font-semibold">Amount</TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {details.expenses.length > 0 ? (
                                                        details.expenses.map((item: any) => (
                                                            <TableRow
                                                                key={item.id}
                                                                className="hover:bg-muted/40 transition-colors cursor-pointer"
                                                            >
                                                                <TableCell className="py-3">
                                                                    {formatDate(item.created_at)}
                                                                </TableCell>
                                                                <TableCell className="py-3 font-medium">{item.name}</TableCell>
                                                                <TableCell className="py-3 text-muted-foreground">
                                                                    {item.description ?? "—"}
                                                                </TableCell>
                                                                <TableCell className="py-3 text-right">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="bg-red-50 border-red-400 text-red-700 text-sm px-3 py-1 font-semibold"
                                                                    >
                                                                        P {Number(item.amount).toLocaleString()}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={4}
                                                                className="text-center py-6 text-muted-foreground"
                                                            >
                                                                No expense records found
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                                {/* ✅ Total Row */}
                                                {details.expenses.length > 0 && (
                                                    <TableFooter>
                                                        <TableRow className="bg-muted/40">
                                                            <TableCell
                                                                colSpan={3}
                                                                className="text-right font-semibold py-3"
                                                            >
                                                                Sub total
                                                            </TableCell>
                                                            <TableCell className="text-right font-bold text-red-700 py-3">
                                                                P {" "}
                                                                {details.expenses
                                                                    .reduce(
                                                                        (sum: number, item: any) => sum + Number(item.amount || 0),
                                                                        0
                                                                    )
                                                                    .toLocaleString("en-PH", {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    })}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableFooter>
                                                )}
                                            </Table>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
