import Heading from '@/components/heading';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PieChart, UserCheck, Users } from 'lucide-react';
import { Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Electoral Polls',
        href: '/tacgeu/polls',
    },
];

interface Poll {
    id: number;
    position: string;
    candidate: string;
    emp_position: string;
    emp_office: string;
    votes: number;
    percentage: number;
    image: string;
}

interface Turnout {
    cast: number;
    total: number;
    percentage: number;
}

export default function Polls() {
    const {
        polls = [],
        turnout = { cast: 0, total: 1, percentage: 0 } as Turnout,
        election = { title: '' },
    } = usePage<{ polls?: Poll[]; turnout?: Turnout; election?: { title: string } }>().props;

    // Group polls by position
    const grouped = polls.reduce<Record<string, Poll[]>>((acc, poll) => {
        if (!acc[poll.position]) acc[poll.position] = [];
        acc[poll.position].push(poll);
        return acc;
    }, {});

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Electoral Poll" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            {!election ? (
                                <div className="text-center text-lg font-medium text-gray-500 dark:text-gray-400 py-10 px-4">
                                    No open election at the moment.
                                </div>
                            ) : (
                                <>
                                    {election?.title && (
                                        <Heading
                                            title={election?.title}
                                            description="Live preview of Tagum City Government Employees' Union (TACGEU) election."
                                        />
                                    )}

                                    {/* Voter Turnout */}
                                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                        {/* Total Voters */}
                                        <div className="flex flex-col items-center justify-center rounded-lg border-t-4 border-blue-500 bg-white p-4 shadow-sm dark:border-blue-400 dark:bg-gray-800">
                                            <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                                            <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Total Voters</span>
                                            <span className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{turnout.cast.toLocaleString()}</span>
                                        </div>

                                        {/* Active Members */}
                                        <div className="flex flex-col items-center justify-center rounded-lg border-t-4 border-green-500 bg-white p-4 shadow-sm dark:border-green-400 dark:bg-gray-800">
                                            <UserCheck className="h-6 w-6 text-green-500 dark:text-green-400" />
                                            <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Active Members</span>
                                            <span className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{turnout.total.toLocaleString()}</span>
                                        </div>

                                        {/* Turnout Rate */}
                                        <div className="flex flex-col items-center justify-center rounded-lg border-t-4 border-yellow-500 bg-white p-4 shadow-sm dark:border-yellow-400 dark:bg-gray-800">
                                            <PieChart className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
                                            <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Turnout Rate</span>
                                            <div className="relative mt-2 flex h-16 w-16 items-center justify-center">
                                                <svg className="absolute h-16 w-16" viewBox="0 0 36 36">
                                                    <path
                                                        className="text-gray-200 dark:text-gray-700"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    />
                                                    <path
                                                        className="text-yellow-500 dark:text-yellow-400"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeDasharray={`${turnout.percentage}, 100`}
                                                    />
                                                </svg>
                                                <span className="relative text-lg font-semibold text-gray-900 dark:text-gray-100">{turnout.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    {Object.entries(grouped).map(([position, candidates]) => (
                                        <section key={position}>
                                            <h2 className="mb-3 text-lg font-semibold">{position}</h2>
                                            <Table>
                                                <TableHeader className="w-full table-fixed bg-gray-100 dark:bg-gray-800">
                                                    <TableRow>
                                                        <TableHead>Candidate</TableHead>
                                                        <TableHead>Votes</TableHead>
                                                        <TableHead>Progress</TableHead>
                                                        <TableHead className="text-center">Percentage</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {candidates
                                                        .sort((a, b) => b.percentage - a.percentage)
                                                        .map(({ id, candidate, emp_position, emp_office, votes, percentage, image }) => (
                                                            <TableRow key={id}>
                                                                <TableCell>
                                                                    <div className="flex w-full items-center gap-4 rounded-lg p-4 transition-colors duration-200">
                                                                        {/* image */}
                                                                        {image ? (
                                                                            <img
                                                                                src={`/storage/${image}`}
                                                                                alt={candidate}
                                                                                className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-300 dark:ring-gray-600"
                                                                                onError={(e) => {
                                                                                    e.currentTarget.onerror = null;
                                                                                    e.currentTarget.style.display = 'none';
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                                                                                No Image
                                                                            </div>
                                                                        )}

                                                                        {/* text block */}
                                                                        <div className="flex flex-col justify-center">
                                                                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                                                                {candidate}
                                                                            </h3>
                                                                            {/* <p className="text-red-600">{emp_position}</p> */}
                                                                            <p>{emp_office}</p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell>{votes.toLocaleString()}</TableCell>
                                                                <TableCell className="w-55">
                                                                    <div className="relative h-8 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                                        <div
                                                                            className="absolute top-0 left-0 h-8 rounded-full bg-green-600 dark:bg-green-400"
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-center">{percentage}%</TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </section>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
