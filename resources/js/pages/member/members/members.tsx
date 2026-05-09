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
import ExportPDF from '@/pages/report/pdf/ExportPDF';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownAZ, ArrowUpZA, FileDown, ScanSearch, UserPen } from 'lucide-react';
import { useState } from 'react';
import { FaRedo } from 'react-icons/fa';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Members',
        href: '/members',
    },
];

type PageProps = {
    offices: string[];
};

type MemberProps = {
    membership_status: string;
};

const salaryGrades = Array.from({ length: 22 }, (_, i) => (i + 1).toString());

export default function Members() {
    const { users } = usePage().props as unknown as UserPageProps;
    const { auth } = usePage().props as any;
    const { membership_status } = usePage<MemberProps>().props;
    const { userList } = usePage().props as any;
    const { offices } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSex, setSelectedSex] = useState('');
    const [selectedCivil, setSelectedCivil] = useState('');
    const [selectedOffice, setSelectedOffice] = useState('');
    const [selectedSalaryGrade, setSelectedSalaryGrade] = useState('');
    const [selectedEducationalAttainment, setSelectedEducationalAttainment] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users.data);
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const fullName = [
        auth.user.given_name,
        auth.user.middle_name,
        auth.user.last_name,
        auth.user.suffix,
    ]
        .filter(Boolean)
        .join(" ");

    const title =
        membership_status === 'Active' ? 'Active Union Members' : membership_status === 'Inactive' ? 'Inactive Union Members' : 'Union Members';
    const description =
        membership_status === 'Active'
            ? 'List of active union members.'
            : membership_status === 'Inactive'
                ? 'List of Inactive union members.'
                : 'List of all union members.';

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

        physically_challenged: boolean;
        solo_parent: boolean;
        adoptive_couple: boolean;
        role: String;
        created_at: string;
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
    const fetchMember = (search = '', sex = '', office = '', education = '', salary = '', memberStatus: string = membership_status) => {
        router.get(
            '/members',
            {
                search,
                sex,
                office,
                education,
                salary,
                membership_status: memberStatus,
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
            '/members',
            {
                search: searchTerm,
                sex: selectedSex,
                office: selectedOffice,
                education: selectedEducationalAttainment,
                salary: selectedSalaryGrade,
                status: membership_status,
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

    // Total number of pages
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const handleViewDataSheet = (user: User) => {
        router.visit(route('membersData', { id: user.id }));
    };

    const handleExportCSV = async () => {
        try {
            const response = await fetch('/union-members/all');
            const allUsers = await response.json();

            const headers = ['id', 'Name', 'month', 'year', 'amount'];

            const rows = allUsers.map((user: { id: any; given_name: any; middle_name: any; last_name: any; month: any; year: any; amount: any }) => [
                user.id,
                `${user.given_name} ${user.middle_name} ${user.last_name}`,
                '',
                '',
                '',
            ]);

            const csvContent =
                'data:text/csv;charset=utf-8,' +
                [headers, ...rows].map((e) => e.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'union_members.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting members:', error);
        }
    };

    const handleEditProfile = (user: User) => {
        router.visit(route('membersUpdate', { id: user.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="w-full px-0 sm:px-2 md:px-4"></div>
            <Head title="Members" />
            <div className="flex h-full w-full flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-6 md:min-h-min">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                    <div className="relative z-10 space-y-4 px-4">
                        <Heading
                            title={title}
                            description={description + ' You can view the detailed data sheet for each member by clicking the eye icon.'}
                        />
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Input
                                placeholder="Search by Name or Email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    fetchMember(value, selectedSex, selectedOffice, selectedEducationalAttainment, selectedSalaryGrade);
                                }}
                                className="w-full md:max-w-sm lg:max-w-full"
                            />
                            {!membership_status && (
                                <Button className="cursor-pointer bg-green-600 text-white hover:bg-green-700" onClick={handleExportCSV}>
                                    <FileDown className="mr-2" />
                                    Export CSV
                                </Button>
                            )}
                            {membership_status && (
                                <ExportPDF
                                    data={(userList ?? []).map((user: {
                                        given_name: string;
                                        middle_name?: string;
                                        last_name: string;
                                        suffix?: string;
                                        sex: string;
                                        created_at: string;
                                        position: string;
                                        office: string;
                                    }) => {
                                        // === Local-safe date formatting (same as your table cell) ===
                                        const raw = user.created_at?.trim();
                                        let formattedDate = "";

                                        if (raw) {
                                            const normalized = raw.replace("T", " ").split(" ")[0]; // take only date part (YYYY-MM-DD)
                                            const [year, month, day] = normalized.split("-").map(Number);

                                            if (year && month && day) {
                                                const localDate = new Date(year, month - 1, day);
                                                if (!isNaN(localDate.getTime())) {
                                                    formattedDate = localDate.toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "2-digit",
                                                        year: "numeric",
                                                    });
                                                }
                                            }
                                        }
                                        return [
                                            [user.given_name, user.middle_name, user.last_name, user.suffix]
                                                .filter(Boolean)
                                                .join(" "),
                                            user.sex,
                                            formattedDate,
                                            user.position,
                                            user.office,
                                        ];
                                    })}
                                    title={
                                        membership_status === "Active"
                                            ? "Active Union Members"
                                            : "Inactive Union Members"
                                    }
                                    subTitle=""
                                    colHeaders={["Name", "Sex", "Date Registered", "Position", "Office"]}
                                    preparedBy={fullName}
                                    role={auth.user.role}
                                />

                            )}
                        </div>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Select
                                onValueChange={(value) => {
                                    setSelectedSex(value);
                                    fetchMember(searchTerm, value, selectedOffice, selectedEducationalAttainment, selectedSalaryGrade);

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
                            {/* <Select
                                onValueChange={(value) => {
                                    setSelectedCivil(value);
                                    fetchMember(searchTerm, selectedSex, value, selectedOffice, selectedEducationalAttainment, selectedSalaryGrade);
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
                            </Select> */}
                            <Select
                                onValueChange={(value) => {
                                    setSelectedOffice(value);
                                    fetchMember(searchTerm, selectedSex, value, selectedEducationalAttainment, selectedSalaryGrade);
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
                            <Select
                                onValueChange={(value) => {
                                    setSelectedEducationalAttainment(value);
                                    fetchMember(searchTerm, selectedSex, selectedOffice, value, selectedSalaryGrade);
                                }}
                                value={selectedEducationalAttainment}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Filter by Educational Attainment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Elementary Graduate">Elementary Graduate</SelectItem>
                                    <SelectItem value="Elementary Undergraduate">Elementary Undergraduate</SelectItem>
                                    <SelectItem value="High School Undergraduate">High School Undergraduate</SelectItem>
                                    <SelectItem value="High School Graduate">High School Graduate</SelectItem>
                                    <SelectItem value="College Undergraduate">College Undergraduate</SelectItem>
                                    <SelectItem value="College Graduate">College Graduate</SelectItem>
                                    <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select onValueChange={(value) => {
                                setSelectedSalaryGrade(value);
                                fetchMember(searchTerm, selectedSex, selectedOffice, selectedEducationalAttainment, value);
                            }}
                                value={selectedSalaryGrade}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select salary grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {salaryGrades.map((sg) => (
                                        <SelectItem key={sg} value={sg}>
                                            {`SG ${sg}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                className="cursor-pointer"
                                onClick={() => {
                                    setSelectedSex('');
                                    setSearchTerm('');
                                    setSelectedOffice('');
                                    setSelectedEducationalAttainment('');
                                    setSelectedSalaryGrade('');
                                    fetchMember();
                                }}
                            >
                                <FaRedo className="mr-2" /> {/* Add the refresh icon */}
                                Reset
                            </Button>
                        </div>

                        <div className="mt-8 w-full overflow-x-auto rounded-lg border dark:border-gray-800">
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
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Date Registered
                                            {sortBy === 'created_at' &&
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
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-[8px] text-gray-500">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="break-words whitespace-normal">
                                                    {user.given_name} {user.middle_name} {user.last_name} {user.suffix}
                                                </TableCell>
                                                <TableCell className="break-words whitespace-normal capitalize">{user.sex}</TableCell>
                                                <TableCell className="break-words whitespace-normal">
                                                    {(() => {
                                                        const raw = user.created_at?.trim();
                                                        if (!raw) return "";

                                                        // Normalize format: replace "T" with space (for ISO strings)
                                                        const normalized = raw.replace("T", " ").split(" ")[0]; // take only the date part (YYYY-MM-DD)

                                                        // Validate format and split
                                                        const [year, month, day] = normalized.split("-").map(Number);
                                                        if (!year || !month || !day) return "";

                                                        // Create a local date safely
                                                        const localDate = new Date(year, month - 1, day);

                                                        if (isNaN(localDate.getTime())) return "";

                                                        return localDate.toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "2-digit",
                                                            year: "numeric",
                                                        });
                                                    })()}
                                                </TableCell>

                                                {/* <TableCell className="px-6 py-4 text-center break-words whitespace-normal capitalize">
                                                {user.employment_status}
                                            </TableCell> */}
                                                <TableCell className="break-words whitespace-normal">{user.position}</TableCell>
                                                <TableCell className="break-words whitespace-normal">{user.office}</TableCell>
                                                <TableCell className="text-center break-words whitespace-normal">
                                                    <div className="flex justify-center gap-2">
                                                        {/* View Data Sheet */}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="cursor-pointer text-blue-600 transition-colors duration-200 hover:text-white"
                                                                        onClick={() => handleViewDataSheet(user)}
                                                                    >
                                                                        <ScanSearch className="h-5 w-5" />
                                                                        <span className="sr-only">View Member Data Sheet</span>
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" align="center">
                                                                    View Member Data Sheet
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {/* Edit Profile */}
                                                        {auth.user.role === 'Membership Committee' && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="icon"
                                                                            className="cursor-pointer text-green-600 transition-colors duration-200 hover:bg-green-600 hover:text-white"
                                                                            onClick={() => handleEditProfile(user)}
                                                                        >
                                                                            <UserPen className="h-5 w-5" />
                                                                            <span className="sr-only">Edit Member Profile</span>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent side="top" align="center">
                                                                        Edit Member Profile
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}

                                                    </div>
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
    );
}
