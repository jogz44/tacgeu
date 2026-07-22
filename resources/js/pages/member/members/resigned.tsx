import Heading from '@/components/heading';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/date';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownAZ, ArrowUpZA, Check, CheckCircle, ChevronLeft, ChevronRight, CircleX, FileDown, Loader2, ScanSearch, Star, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaRedo } from 'react-icons/fa';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import ExportPDF from '@/pages/report/pdf/ExportPDF';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Terminated Memberships',
        href: '/tacgeu/resigned',
    },
];

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

    status: string;
    membership_status: string;
}

interface UserPageProps {
    members: {
        data: User[];
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        search: string;
        status: string;
        paymentType: string;
        bookType: string;
    };
}

interface Position {
    id: number;
    title: string;
}

interface Department {
    id: number;
    name: string;
}

export default function Resigned() {
    const { members, filters } = usePage().props as unknown as UserPageProps;
    const statuses = ['Pending', 'Approved'];
    const [search, setSearch] = useState('');
    const [position, setPosition] = useState<Position[]>([]);
    const [department, setDepartment] = useState<Department[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<string>(""); // selected value
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [selectedTab, setSelectedTab] = useState("Pending");
    const { auth } = usePage().props as any;

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Customize the number of items per page
    const fullName = [
        auth.user.given_name,
        auth.user.middle_name,
        auth.user.last_name,
        auth.user.suffix,
    ]
        .filter(Boolean)
        .join(" ");

    useEffect(() => {
        const fetchPosition = async () => {
            const response = await axios.get('/tacgeu/position');
            const data = Array.isArray(response.data) ? response.data : [];
            setPosition(data);
        };

        const fetchDepartment = async () => {
            const response = await axios.get('/tacgeu/department');
            const data = Array.isArray(response.data) ? response.data : [];
            setDepartment(data);
        };
        fetchPosition();
        fetchDepartment();
    }, []);


    const getFilteredMembers = (status: string) => {
        return members.data.filter((user) => {
            const mem_status = user.membership_status ?? '';
            const user_status = user.status ?? '';
            const fullName = `${user.given_name} ${user.last_name} ${user.middle_name ?? ''} ${user.suffix ?? ''}`.toLowerCase();

            // Normalize search filters to lowercase
            const searchTerm = search.trim().toLowerCase();
            const selected_position = selectedPosition.toLowerCase();
            const selected_department = selectedDepartment.toLowerCase();

            // Determine matches based on tab status
            let matchesStatus = false;
            if (status === 'Pending') {
                matchesStatus = user_status === 'Resigned' && mem_status === 'Active';
            } else {
                matchesStatus = user_status === 'Resigned' && mem_status === 'Inactive';
            }

            const matchesSearch = searchTerm === '' || fullName.includes(searchTerm);
            const matchesPosition = selected_position === '' || user.position?.toLowerCase() === selected_position;
            const matchesDepartment = selected_department === '' || user.office?.toLowerCase() === selected_department;

            return matchesStatus && matchesSearch && matchesPosition && matchesDepartment;
        });
    };

    const handleSort = (field: string) => {
        const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        router.get(
            '/tacgeu/resigned',
            {
                search: search,
                position: selectedPosition,
                department: selectedDepartment,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleApprove = (user: any) => {
        router.post(
            route('members.approved', user.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Approved Membership Withdrawal', {
                        description: `${user.given_name} ${user.middle_name ?? ''} ${user.last_name}`.trim() + ' has successfully had their membership withdrawal approved.',
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 2500,
                    });
                },
                onError: (errors) => {
                    toast.error('Error', {
                        description: errors.error,
                        icon: <CircleX className="h-5 w-5 text-red-500" />,
                        duration: 2500,
                    });
                    console.error(errors);
                },
            }
        );
    };

    const handleReject = (user: any) => {
        router.post(
            route('members.rejected', user.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Reject Membership Withdrawal', {
                        description: `${user.given_name} ${user.middle_name ?? ''} ${user.last_name}`.trim() + ' has had their membership withdrawal request rejected.',
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 2500,
                    });
                },
                onError: (errors) => {
                    toast.error('Error', {
                        description: errors.error,
                        icon: <CircleX className="h-5 w-5 text-red-500" />,
                        duration: 2500,
                    });
                    console.error(errors);
                },
            }
        );
    };

    const handleViewDataSheet = (user: User) => {
        router.visit(route('membersData', { id: user.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster position="top-right" />
            <div className="w-full px-0 sm:px-2 md:px-4"></div>
            <Head title="Terminated Memberships" />
            <div className="flex h-full w-full flex-col gap-4 p-4">
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-6 md:min-h-min">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                    <div className="relative z-10 space-y-4 px-4">
                        <Heading
                            title='Withdraw Membership'
                            description="List of members who have pending and approved withdrawal of membership and are no longer active in the TACGEU."
                        />
                        <Tabs defaultValue="Pending" className="w-full mt-4">
                            <TabsList className="flex w-full flex-wrap items-center justify-between rounded-3xl border">
                                {statuses.map((status) => (
                                    <TabsTrigger
                                        key={status}
                                        value={status}
                                        className="cursor-pointer rounded-3xl px-4 py-4 text-sm font-medium focus:ring-2 focus:ring-green-600 focus:outline-none
        data-[state=active]:bg-green-600 data-[state=active]:text-white"
                                    >
                                        {status}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <Card className="bg-white dark:bg-gray-800">
                                <CardContent>
                                    <div className="mb-4 flex items-center gap-4">
                                        <Input
                                            placeholder="Search by member..."
                                            value={search}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSearch(value);
                                            }}
                                            className=""
                                        />
                                        {/* Position Filter */}
                                        <Select value={selectedPosition} onValueChange={(value) => setSelectedPosition(value)}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Select position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {position.map((pos) => (
                                                    <SelectItem key={pos.id} value={pos.title}>
                                                        {pos.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Department Filter */}
                                        <Select value={selectedDepartment} onValueChange={(value) => setSelectedDepartment(value)}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="Select office/department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {department.map((dept) => (
                                                    <SelectItem key={dept.id} value={dept.name}>
                                                        {dept.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            className="cursor-pointer"
                                            onClick={() => {
                                                setSelectedDepartment('');
                                                setSelectedPosition('');
                                                setSearch('');
                                            }}
                                        >
                                            <FaRedo className="mr-2 " /> {/* Add the refresh icon */}
                                            Reset
                                        </Button>
                                    </div>

                                    {statuses.map((status) => {
                                        const tabFilteredMembers = getFilteredMembers(status) || [];

                                        return (
                                            <TabsContent key={status} value={status}>
                                                {/* === Export PDF Button === */}
                                                <div className="flex justify-end mb-4 mt-2">
                                                    <ExportPDF
                                                        data={tabFilteredMembers.map((user) => [
                                                            [user.given_name, user.middle_name, user.last_name, user.suffix]
                                                                .filter(Boolean)
                                                                .join(" "),
                                                            user.sex,
                                                            formatDate(user.birthdate),
                                                            user.position,
                                                            user.office,
                                                        ])}
                                                        title={
                                                            status === "Pending"
                                                                ? "Pending Members Withdrawal"
                                                                : "Approved Members Withdrawal"
                                                        }
                                                        subTitle=""
                                                        colHeaders={["Name", "Sex", "Birthdate", "Position", "Office"]}
                                                        preparedBy={fullName}
                                                        role={auth.user.role}
                                                    />
                                                </div>

                                                <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                                    <Table className="w-full divide-y divide-gray-200 dark:divide-gray-700 ">
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
                                                            {tabFilteredMembers.length === 0 ? (
                                                                <TableRow>
                                                                    <TableCell colSpan={8} className="py-4 text-center">
                                                                        No bookings found.
                                                                    </TableCell>
                                                                </TableRow>
                                                            ) : (
                                                                tabFilteredMembers.map((user) => (
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
                                                                        <TableCell className="break-words whitespace-normal">{formatDate(user.birthdate)}</TableCell>
                                                                        <TableCell className="break-words whitespace-normal">{user.position}</TableCell>
                                                                        <TableCell className="break-words whitespace-normal">{user.office}</TableCell>
                                                                        <TableCell className="text-center break-words whitespace-normal">
                                                                            <div className="flex justify-center items-center space-x-2">
                                                                                {/* View Data Sheet Button */}
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
                                                                                                <span className="sr-only">View Members Data Sheet</span>
                                                                                            </Button>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent side="top" align="center">
                                                                                            View Members Data Sheet
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>

                                                                                {/* Approval Button - Only if user.status = Resigned */}
                                                                                {user.status === 'Resigned' && user.membership_status === 'Active' && (
                                                                                    <AlertDialog>
                                                                                        <TooltipProvider>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger asChild>
                                                                                                    <AlertDialogTrigger asChild>
                                                                                                        <Button
                                                                                                            variant="outline"
                                                                                                            size="icon"
                                                                                                            className="cursor-pointer bg-red-700 text-white transition-colors duration-200 hover:bg-red-500"
                                                                                                        >
                                                                                                            <Check className="h-5 w-5" />
                                                                                                            <span className="sr-only">Approve Membership Withdrawal</span>
                                                                                                        </Button>
                                                                                                    </AlertDialogTrigger>
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent side="top" align="center">
                                                                                                    Approve or Reject Membership Withdrawal
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </TooltipProvider>

                                                                                        {/* Confirmation Dialog */}
                                                                                        <AlertDialogContent>
                                                                                            <AlertDialogHeader>
                                                                                                <AlertDialogTitle>Approve Membership Withdrawal</AlertDialogTitle>
                                                                                                <AlertDialogDescription>
                                                                                                    Are you sure you want to approve <b className="text-red-600">{user.given_name} {user.middle_name} {user.last_name} {user.suffix}</b> withdrawal?
                                                                                                    This action cannot be undone.
                                                                                                </AlertDialogDescription>
                                                                                            </AlertDialogHeader>
                                                                                            <AlertDialogFooter className="mt-8">
                                                                                                <div className="flex gap-2">
                                                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                                                    <AlertDialogAction
                                                                                                        onClick={() => handleReject(user)}
                                                                                                        className="bg-gray-600 hover:bg-gray-500 text-white cursor-pointer"
                                                                                                    >
                                                                                                        Reject Withdrawal
                                                                                                    </AlertDialogAction>
                                                                                                </div>
                                                                                                <AlertDialogAction
                                                                                                    onClick={() => handleApprove(user)}
                                                                                                    className="bg-red-700 hover:bg-red-500 text-white cursor-pointer"
                                                                                                >
                                                                                                    Yes, Approve Withdrawal
                                                                                                </AlertDialogAction>
                                                                                            </AlertDialogFooter>
                                                                                        </AlertDialogContent>
                                                                                    </AlertDialog>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>

                                                                    </TableRow>
                                                                ))
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </TabsContent>
                                        );
                                    })}

                                </CardContent>
                            </Card>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
