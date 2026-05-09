import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/date';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownAZ, ArrowUpZA, ScanSearch } from 'lucide-react';
import { useState } from 'react';
import { FaRedo } from 'react-icons/fa';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Applicants',
        href: '/applicants',
    },
];

type PageProps = {
    offices: string[];
};

type StatusProps = {
    filterStatus: string;
};

export default function Members() {
    const { users } = usePage().props as unknown as UserPageProps;
    const { filterStatus } = usePage<StatusProps>().props;
    const { offices } = usePage<PageProps>().props;
    const { auth } = usePage().props as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSex, setSelectedSex] = useState('');
    const [selectedCivil, setSelectedCivil] = useState('');
    const [selectedOffice, setSelectedOffice] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users.data);
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const title =
        auth?.user?.role === 'Treasurer'
            ? 'Pending Union Membership'
            : filterStatus === 'Rejected'
              ? 'Rejected Union Applicants'
              : filterStatus === 'Pending'
                ? 'Pending Union Applicants'
                : filterStatus === 'Conditional Pre-approve'
                  ? 'Conditional Pre-approve Union Applicants'
                  : filterStatus === 'Conditional Approve'
                    ? 'Conditional Approve Union Applicants'
                    : 'Applicants for Union Membership';
    const description =
        auth?.user?.role === 'Treasurer'
            ? 'A list of applicants who have pending membership fee payment.'
            : filterStatus === 'Rejected'
              ? 'A list of applicants who have rejected for membership.'
              : filterStatus === 'Pending'
                ? 'A list of applicants who have pending approval for membership.'
                : filterStatus === 'Conditional Pre-approve'
                  ? 'A list of applicants who have pending a conditional pre-approval for membership.'
                  : filterStatus === 'Conditional Approve'
                    ? 'A list of applicants who have pending a conditional approval for membership.'
                    : 'A list of individuals who have applied for union membership. You can access detailed information about each applicant by clicking the eye icon next to their name.';

    interface User {
        id: number;
        image: string;
        last_name: string;
        given_name: string;
        middle_name: string;
        suffix: string;
        nickname: string;
        address: string;
        contact_number: string;
        email: string;

        birthdate: string;
        birthplace: string;
        sex: string;
        civil_status: string;
        spouse_name: string;
        religion: string;

        education: string;
        college_degree: string;
        postgrad_degree: string;

        position: string;
        salary_grade: string;
        office: string;
        status: String;
        physically_challenged: boolean;
        solo_parent: boolean;
        adoptive_couple: boolean;
        role: String;
    }

    interface UserPageProps {
        users: {
            data: User[];
            current_page: number;
            last_page: number;
            links: {
                url: string | null;
                label: string;
                active: boolean;
            }[];
        };
    }

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Customize the number of items per page

    const fetchMember = (search = '', sex = '', civil = '', office = '', status = filterStatus) => {
        router.get(
            '/applicants',
            {
                search,
                sex,
                civil,
                office,
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
            '/applicants',
            {
                search: searchTerm,
                sex: selectedSex,
                civil: selectedCivil,
                status: filterStatus,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Calculate the index range for the current page
    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const handleViewDataSheet = (user: User) => {
        router.visit(route('membersData', { id: user.id }));
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Applicants" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading title={title} description={description} />
                            <div className="flex flex-col md:flex-row md:items-center">
                                <Input
                                    placeholder="Search by Name or Email..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchTerm(value);
                                        fetchMember(value, selectedSex, selectedCivil, selectedOffice);
                                    }}
                                    className="w-full md:max-w-sm lg:max-w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <Select
                                    onValueChange={(value) => {
                                        setSelectedSex(value);
                                        fetchMember(searchTerm, value, selectedCivil, selectedOffice);
                                    }}
                                    value={selectedSex}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by Sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    onValueChange={(value) => {
                                        setSelectedCivil(value);
                                        fetchMember(searchTerm, selectedSex, value, selectedOffice);
                                    }}
                                    value={selectedCivil}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by Civil Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Married">Married</SelectItem>
                                        <SelectItem value="Widow/Widower">Widow/Widower</SelectItem>
                                        <SelectItem value="Separated">Separated</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    onValueChange={(value) => {
                                        setSelectedOffice(value);
                                        fetchMember(searchTerm, selectedSex, selectedCivil, value);
                                    }}
                                    value={selectedOffice}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by Office/Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {offices.map((office) => (
                                            <SelectItem key={office} value={String(office)}>
                                                {office}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSelectedSex('');
                                        setSelectedCivil('');
                                        setSelectedOffice('');
                                        fetchMember();
                                    }}
                                >
                                    <FaRedo className="mr-2" /> {/* Add the refresh icon */}
                                    Reset
                                </Button>
                            </div>

                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead className="text-sm tracking-wider break-words whitespace-normal text-white">Image</TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('sex')}
                                            >
                                                Sex
                                                {sortBy === 'sex' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('birthdate')}
                                            >
                                                Birthdate
                                                {sortBy === 'birthdate' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            {/* <TableHead
                                                className="cursor-pointer px-6 py-3 text-center text-xs font-medium tracking-wider break-words whitespace-normal text-white uppercase hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('employment_status')}
                                            >
                                                Employment Status
                                                {sortBy === 'employment_status' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead> */}
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('position')}
                                            >
                                                Position
                                                {sortBy === 'position' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('office')}
                                            >
                                                Office
                                                {sortBy === 'office' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead className="text-center text-sm tracking-wider text-white dark:text-gray-300"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {users.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="py-8 text-center text-sm text-gray-500">
                                                    No {title}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.data.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex w-full items-center p-2 dark:border-gray-700 dark:bg-gray-900">
                                                            {/* Profile Image */}
                                                            {user.image ? (
                                                                <img
                                                                    src={`/storage/${user.image}`}
                                                                    alt={`${user.given_name} ${user.last_name}`}
                                                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-yellow-500"
                                                                    onError={(e) => {
                                                                        e.currentTarget.onerror = null;
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="break-words whitespace-normal">
                                                        {user.given_name} {user.middle_name} {user.last_name} {user.suffix}
                                                    </TableCell>
                                                    <TableCell className="break-words whitespace-normal capitalize">{user.sex}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{formatDate(user.birthdate)}</TableCell>
                                                    {/* <TableCell className="px-6 py-4 text-center break-words whitespace-normal capitalize">
                                                    {user.employment_status}
                                                </TableCell> */}
                                                    <TableCell className="break-words whitespace-normal">{user.position}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{user.office}</TableCell>
                                                    <TableCell className="text-center break-words whitespace-normal">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="cursor-pointer text-blue-600 transition-colors duration-200 hover:text-blue-800"
                                                                        onClick={() => handleViewDataSheet(user)}
                                                                    >
                                                                        <ScanSearch className="h-5 w-5" />
                                                                        <span className="sr-only">View Members Data Sheet</span>{' '}
                                                                        {/* For accessibility */}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" align="center">
                                                                    View Members Data Sheet
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {/* Pagination Controls */}
                            {users && users.links && users.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {users.links.map((link, index) => (
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
            </AppLayout>
        </>
    );
}
