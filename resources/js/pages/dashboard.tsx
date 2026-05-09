import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { HandCoins, Users, UserX, Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CountUp from 'react-countup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageProps } from '@inertiajs/core';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

type CardVariant = 'default' | 'success' | 'danger' | 'info' | 'warning';

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const formatMonth = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const formatYear = (date: Date) => String(date.getFullYear());

const variantClasses: Record<CardVariant, { bg: string }> = {
    default: { bg: 'bg-gray-500 dark:bg-gray-900' },
    success: { bg: 'bg-green-500 dark:bg-green-900' },
    danger: { bg: 'bg-red-500 dark:bg-red-900' },
    info: { bg: 'bg-blue-500 dark:bg-blue-900' },
    warning: { bg: 'bg-yellow-500 dark:bg-yellow-900' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-md border border-gray-300 bg-white p-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        ₱ {parseFloat(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


type User = {
    fullname: string;
}

type Collection = {
    name: string;
    description: string;
    amount: number;
}

interface Contributions {
    user_id: number;
    month: string;
    year: number;
    amount: number;
    status: string;
    created_at: string;
    user: User;
}

interface Payment {
    collection: Collection;
    user: User;
    amount: number;
    created_at: string;
}

interface Expenses {
    name: string;
    amount: number;
    spent_at: string;
}

interface DashboardProps extends PageProps {
    activeMembers?: number;
    inactiveMembers?: number;
    totalCollection?: number;
    totalExpenses?: number;
    totalContributions?: number;

    trendActiveMembers?: string;
    trendInactiveMembers?: string;
    trendTotalCollection?: string;
    trendTotalExpenses?: string;
    trendTotalContributions?: string;

    recentPayments?: Payment[];
    recentExpenses?: Expenses[];
    recentContributions?: Contributions[];

    collectionChart?: any[];
    expenseChart?: any[];
    contributionChart?: any[];

    viewType: string;
    selectedDate: string;
}

export default function Dashboard() {
    const { props } = usePage<DashboardProps>();
    const activeMembers = props.activeMembers ?? 0;
    const inactiveMembers = props.inactiveMembers ?? 0;
    const totalCollection = props.totalCollection ?? 0;
    const totalExpenses = props.totalExpenses ?? 0;
    const totalContributions = props.totalContributions ?? 0;

    const trendActiveMembers = props.trendActiveMembers ?? '0%';
    const trendInactiveMembers = props.trendInactiveMembers ?? '0%';
    const trendTotalCollection = props.trendTotalCollection ?? '0%';
    const trendTotalExpenses = props.trendTotalExpenses ?? '0%';
    const trendTotalContributions = props.trendTotalContributions ?? '0%';

    const collectionChartData = Array.isArray(props.collectionChart) ? props.collectionChart : [];
    const expenseChartData = Array.isArray(props.expenseChart) ? props.expenseChart : [];
    const contributionChartData = Array.isArray(props.contributionChart) ? props.contributionChart : [];
    const recentPayments = Array.isArray(props.recentPayments) ? props.recentPayments : [];
    const recentExpenses = Array.isArray(props.recentExpenses) ? props.recentExpenses : [];
    const recentContributions = Array.isArray(props.recentContributions) ? props.recentContributions : [];
    const [viewType, setViewType] = useState(props.viewType ?? 'daily');
    const [selectedDate, setSelectedDate] = useState(props.selectedDate ?? '');

    const handleViewTypeChange = (val: 'daily' | 'monthly' | 'yearly') => {
        let newDate: string;
        if (val === 'daily') newDate = formatDate(today);
        else if (val === 'monthly') newDate = formatMonth(today);
        else newDate = formatYear(today);

        setViewType(val);
        setSelectedDate(newDate);
        fetchData(val, newDate);
    };

    useEffect(() => {
        let newDate = viewType === 'daily'
            ? formatDate(today)
            : viewType === 'monthly'
                ? formatMonth(today)
                : formatYear(today);

        setSelectedDate(newDate);
    }, [viewType]);

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        fetchData(viewType, date);
    };

    const fetchData = (type: string, date: string) => {
        router.get(route('dashboard'), { viewType: type, selectedDate: date }, { preserveScroll: true, preserveState: true, replace: true });
    };

    const chartKey = viewType === 'daily' ? 'day' : viewType === 'monthly' ? 'month' : 'year';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">

                {/* === Controls === */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard Overview</h1>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="viewType" className="text-sm">View:</Label>
                            <Select value={viewType} onValueChange={(val: any) => handleViewTypeChange(val)}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select view" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {viewType === 'daily' && <Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} />}
                        {viewType === 'monthly' && <Input type="month" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} />}
                        {viewType === 'yearly' && <Input type="number" min="2000" max={new Date().getFullYear()} value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} />}
                    </div>
                </div>

                {/* Membership Section */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <CardArea
                        title="Active Members"
                        icon={<Users className="h-8 w-8 text-white" />}
                        value={activeMembers.toString()}
                        trend={trendActiveMembers}
                        variant="success"
                    />
                    <CardArea
                        title="Inactive Members"
                        icon={<UserX className="h-8 w-8 text-white" />}
                        value={inactiveMembers.toString()}
                        trend={trendInactiveMembers}
                        variant="default"
                    />
                </div>

                {/* Financial Section */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <CardArea
                        title="Contributions"
                        icon={<PiggyBank className="h-8 w-8 text-white" />}
                        value={totalContributions.toLocaleString()}
                        trend={trendTotalContributions}
                        variant="warning"
                        showDecimal={true}
                    />
                    <CardArea
                        title="Collections"
                        icon={<HandCoins className="h-8 w-8 text-white" />}
                        value={totalCollection.toLocaleString()}
                        trend={trendTotalCollection}
                        variant="info"
                        showDecimal={true}
                    />
                    <CardArea
                        title="Expenses"
                        icon={<Wallet className="h-8 w-8 text-white" />}
                        value={totalExpenses.toLocaleString()}
                        trend={trendTotalExpenses}
                        variant="danger"
                        showDecimal={true}
                    />
                </div>

                {/* === Contributions === */}
                <Card className="shadow-md border-0 bg-emerald-50 dark:bg-emerald-900/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-8 w-8 text-emerald-500" />
                            <CardTitle className="text-emerald-700 dark:text-emerald-300 text-2xl">
                                {capitalize(viewType)} Contributions
                            </CardTitle>
                        </div>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            Member contributions overview
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                            <div>
                                <Chart title="" data={contributionChartData} dataKey={chartKey} barColor="#34d399" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Recent Contributions
                                </h3>
                                <div className="min-h-[400px] max-h-[400px] overflow-y-auto rounded-lg border dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-emerald-100 dark:bg-emerald-800/50 border-b dark:border-gray-700">
                                                <th className="p-2 text-left">Member</th>
                                                <th className="p-2 text-center">Amount</th>
                                                <th className="p-2 text-center">Transaction Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentContributions.length > 0 ? recentContributions.map((p, idx) => (
                                                <tr key={idx} className="border-b last:border-0 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition">

                                                    <td className="p-2">{p.user.fullname}</td>
                                                    <td className="p-2 text-center font-semibold text-emerald-600">₱ {Number(p.amount).toLocaleString()}</td>
                                                    <td className="p-2 text-center">
                                                        {new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={3} className="p-4 text-center text-gray-500">No recent contributions found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* === Collections === */}
                <Card className="shadow-md border-0 bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-8 w-8 text-blue-500" />
                            <CardTitle className="text-blue-700 dark:text-blue-300 text-2xl">
                                {capitalize(viewType)} Collections
                            </CardTitle>
                        </div>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            Summary of collected payments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                            <div>
                                <Chart title="" data={collectionChartData} dataKey={chartKey} barColor="#3b82f6" />
                            </div>
                            <div>

                                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Recent Collections
                                </h3>
                                <div className="min-h-[400px] max-h-[400px] overflow-y-auto rounded-lg border dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-blue-100 dark:bg-blue-800/50 border-b dark:border-gray-700">
                                                <th className="p-2 text-left">Member</th>
                                                <th className="p-2 text-left">Collection</th>
                                                <th className="p-2 text-center">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentPayments.length > 0 ? recentPayments.map((p, idx) => (
                                                <tr key={idx} className="border-b last:border-0 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition">
                                                    <td className="p-2">{p.user.fullname}</td>
                                                    <td className="p-2">{p.collection.name}</td>
                                                    <td className="p-2 font-semibold text-blue-600">₱ {Number(p.amount).toLocaleString()}</td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={3} className="p-4 text-center text-gray-500">No recent collections found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* === Expenses === */}
                <Card className="shadow-md border-0 bg-red-50 dark:bg-red-900/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-8 w-8 text-red-500" />
                            <CardTitle className="text-red-700 dark:text-red-300 text-2xl">
                                {capitalize(viewType)} Expenses
                            </CardTitle>
                        </div>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            Breakdown of recent outgoing expenses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                            <div>
                                <Chart title="" data={expenseChartData} dataKey={chartKey} barColor="#f87171" />
                            </div>
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Recent Expenses
                                </h3>
                                <div className="min-h-[400px] max-h-[400px] overflow-y-auto rounded-lg border dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-red-100 dark:bg-red-800/50 border-b dark:border-gray-700">
                                                <th className="p-2 text-left">Expense</th>
                                                <th className="p-2 text-center">Amount</th>
                                                <th className="p-2 text-center">Transaction Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentExpenses.length > 0 ? recentExpenses.map((p, idx) => (
                                                <tr key={idx} className="border-b last:border-0 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/40 transition">
                                                    <td className="p-2">{p.name}</td>
                                                    <td className="p-2 font-semibold text-red-600 text-center">₱ {Number(p.amount).toLocaleString()}</td>
                                                    <td className="p-2 text-center">
                                                        {new Date(p.spent_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr><td colSpan={2} className="p-4 text-center text-gray-500">No recent expenses found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </div>
        </AppLayout>
    );
}

/* === Summary Card with Trend === */
function CardArea({ title, icon, value, trend, variant = 'default', showDecimal = false, }: {
    title: string;
    icon: React.ReactNode;
    value: string;
    trend?: string;
    variant?: CardVariant;
    showDecimal?: boolean;
}) {
    const { bg } = variantClasses[variant];
    const [count, setCount] = useState(0);
    const isPositive = trend?.startsWith('+');


    useEffect(() => {
        setCount(Number(value.replace(/,/g, '')));
    }, [value]);

    return (
        <div className={`rounded-xl border ${bg} p-6 shadow-md transition transform hover:scale-105 hover:shadow-lg`}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                {icon}
            </div>
            <p className="mt-2 text-3xl font-bold text-white">
                <CountUp end={count} duration={1.5} separator="," prefix={
                    title.includes("₱") ||
                        ["Contributions", "Collections", "Expenses"].some((t) =>
                            title.toLowerCase().includes(t.toLowerCase())
                        )
                        ? "₱ "
                        : ""
                } decimals={showDecimal ? 2 : 0} />
            </p>
            {trend && (
                <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-200' : 'text-red-200'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {trend} vs last period
                </div>
            )}
        </div>
    );
}

/* === Reusable Chart === */
function Chart({ title, data, dataKey, barColor }: { title: string; data: any[]; dataKey: string; barColor: string }) {
    const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

    return (
        <div className="rounded-xl border bg-white dark:bg-gray-900 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
                <button
                    onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
                    className="rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    Switch to {chartType === 'bar' ? 'Line' : 'Bar'}
                </button>
            </div>
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                    {chartType === 'bar' ? (
                        <BarChart key={dataKey} data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={dataKey}
                                height={50}
                                padding={{ left: 10, right: 10 }}
                                tick={({ x, y, payload }) => {
                                    const lines = payload.value.split('\n'); // assumes server sends "\n" as line break
                                    return (
                                        <g transform={`translate(${x},${y + 10})`}>
                                            {lines.map((line: any, index: number) => (
                                                <text key={index} x={0} y={index * 30} textAnchor="middle" fill="#555" fontSize={14}>
                                                    {line}
                                                </text>
                                            ))}
                                        </g>
                                    );
                                }}
                                tickFormatter={(value) => value.toString()}
                            />
                            <YAxis domain={[0, (dataMax: number) => dataMax * 1.25]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="amount" fill={barColor} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    ) : (
                        <LineChart key={dataKey} data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey={dataKey}
                                height={50}
                                padding={{ left: 10, right: 10 }}
                                tick={({ x, y, payload }) => {
                                    const lines = payload.value.split('\n');
                                    return (
                                        <g transform={`translate(${x},${y + 10})`}>
                                            {lines.map((line: any, index: number) => (
                                                <text key={index} x={0} y={index * 20} textAnchor="middle" fill="#555" fontSize={14}>
                                                    {line}
                                                </text>
                                            ))}
                                        </g>
                                    );
                                }}
                                tickFormatter={(value) => value.toString()}
                            />
                            <YAxis domain={[0, (dataMax: number) => dataMax * 1.25]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="amount" stroke={barColor} strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            ) : (
                <p className="text-center text-gray-500">No data available</p>
            )}
        </div>
    );
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
