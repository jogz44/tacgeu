import Heading from '@/components/heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownAZ, ArrowUpZA, Ban, CheckCircle, CheckCircle2, CircleX, Clock, LoaderCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { FaPlusCircle, FaRedo, FaTrash, FaUserCheck, FaUserCog } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles',
        href: '/tacgeu/roles',
    },
];

export default function Roles() {
    const { users } = usePage().props as unknown as UserPageProps;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [updatedRole, setUpdatedRole] = useState('');
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [decision, setDecision] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    interface User {
        id: number;
        given_name: string;
        last_name: string;
        middle_name: string;
        email: string;
        role: string;
        status: string;
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

    const fetchUsers = (search = '', role = '', status = '') => {
        router.get(
            '/tacgeu/roles',
            {
                search,
                role,
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
            '/tacgeu/roles', // or use a static string like `/tacgeu/roles`
            {
                search: searchTerm,
                role: selectedRole,
                status: selectedStatus,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const updateUserRole = (userId: number, fullname: string, newRole: string) => {
        setIsUpdating(true);
        router.put(
            `/users/${userId}/role`,
            { role: newRole },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`User Role`, {
                        description: `Member ${fullname} has been successfully updated to new role ${newRole}.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    });
                    setTimeout(() => {
                        setIsUpdating(false);
                    }, 1000);
                    console.log(`Member ${userId} ${fullname} has been successfully updated to new role ${newRole}.`);
                },
                onError: (errors) => {
                    toast.error('Message', {
                        description: errors?.role ?? 'An unexpected error occurred.',
                    });
                    setIsUpdating(false);
                    console.error('Failed to update role:', errors);
                },
            },
        );
    };

    const processMembershipDecision = (userId: number, fullname: string, status: string) => {
        setIsProcessing(true);
        router.put(
            `/users/${userId}/status`,
            { status: status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Update Status`, {
                        description: `Officer ${fullname} has been ${status}.`,
                        icon:
                            status === 'Approved' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <CheckCircle className="h-5 w-5 text-red-500" />,
                    });
                    setTimeout(() => {
                        setIsProcessing(false);
                    }, 1000);
                },
                onError: (errors) => {
                    toast.error('Failed to update status', {
                        description: errors?.role ?? 'An unexpected error occurred.',
                    });
                    setIsProcessing(false);
                    console.error('Failed to update Status:', errors);
                },
            },
        );
    };

    const deleteUser = (userId: number, fullname: string) => {
        setIsDeleting(true);
        router.delete(`/users/${userId}/delete`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`User Deleted`, {
                    description: `Officer ${fullname} has been permanently removed.`,
                    icon: <XCircle className="h-5 w-5 text-red-500" />,
                });
                setTimeout(() => {
                    setIsDeleting(false);
                }, 1000);
            },
            onError: (errors) => {
                toast.error('Failed to delete user', {
                    description: errors?.message ?? 'An unexpected error occurred.',
                });
                setIsDeleting(false);
                console.error('Failed to delete user:', errors);
            },
        });
    };

    const handleAddUser = () => {
        router.visit(route('roles.index'));
    }

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="User Roles" />
                <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-6 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading
                                title="User Roles"
                                description="List of user roles defining their permissions and responsibilities within a system or organization."
                            />
                            <div className="flex w-full flex-col gap-4">
                                {/* Top row with Add User on right */}
                                <div className="flex w-full items-center">
                                    <Button
                                        onClick={handleAddUser}
                                        className="ml-auto flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                    >
                                        <FaPlusCircle className="h-4 w-4" />
                                        Add User
                                    </Button>
                                </div>

                                {/* Filters Row */}
                                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                    <Input
                                        placeholder="Search by Name or Email..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSearchTerm(value);
                                            fetchUsers(value, selectedRole, selectedStatus);
                                        }}
                                        className="w-full"
                                    />

                                    <Select
                                        onValueChange={(value) => {
                                            setSelectedRole(value);
                                            fetchUsers(searchTerm, value, selectedStatus);
                                        }}
                                        value={selectedRole}
                                    >
                                        <SelectTrigger className="w-2/4">
                                            <SelectValue placeholder="Filter by role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="President">President</SelectItem>
                                            <SelectItem value="Treasurer">Treasurer</SelectItem>
                                            <SelectItem value="Human Resource Officer">Human Resource Officer</SelectItem>
                                            <SelectItem value="Membership Committee">Membership Committee</SelectItem>
                                            <SelectItem value="Election Committee">Election Committee</SelectItem>
                                            <SelectItem value="Public Information Officer">Public Information Officer</SelectItem>
                                            <SelectItem value="Visitor">Visitor</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        onValueChange={(value) => {
                                            setSelectedStatus(value);
                                            fetchUsers(searchTerm, selectedRole, value);
                                        }}
                                        value={selectedStatus}
                                    >
                                        <SelectTrigger className="w-2/4">
                                            <SelectValue placeholder="Filter by Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Approved">Approved</SelectItem>
                                            <SelectItem value="Ended">Ended</SelectItem>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setSelectedStatus('');
                                            setSelectedRole('');
                                            setSearchTerm('');
                                            fetchUsers('', '', '');
                                        }}
                                    >
                                        <FaRedo className="mr-2" /> Reset
                                    </Button>
                                </div>
                            </div>

                            <div className="w-full flex-1 overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:hover:bg-teal-600"
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
                                                className="cursor-pointertext-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('email')}
                                            >
                                                Email
                                                {sortBy === 'email' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('role')}
                                            >
                                                Role
                                                {sortBy === 'role' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider text-center break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('status')}
                                            >
                                                Status
                                                {sortBy === 'status' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead className='text-white text-center'>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                                        {users.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-500">
                                                    No Users Found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.data.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell className="break-words whitespace-normal">
                                                        {user.given_name} {user.middle_name} {user.last_name}
                                                    </TableCell>
                                                    <TableCell className="break-words whitespace-normal">{user.email}</TableCell>
                                                    <TableCell className="break-words whitespace-normal capitalize">{user.role}</TableCell>
                                                    <TableCell className="break-words whitespace-normal capitalize">
                                                        <Badge
                                                            className={`
      flex items-center gap-1 px-2 py-1
      ${user.status === "Approved"
                                                                    ? "bg-green-500 text-white"
                                                                    : user.status === "Rejected"
                                                                        ? "bg-red-500 text-white"
                                                                        : user.status === "Ended"
                                                                            ? "bg-gray-700 text-white"
                                                                            : user.status === "Pending"
                                                                                ? "bg-yellow-500 text-white"
                                                                                : "bg-gray-300 text-black"
                                                                }
    `}
                                                        >
                                                            {user.status === "Approved" && <CheckCircle2 size={14} />}
                                                            {user.status === "Rejected" && <XCircle size={14} />}
                                                            {user.status === "Ended" && <Ban size={14} />}
                                                            {user.status === "Pending" && <Clock size={14} />}
                                                            {user.status !== "Approved" &&
                                                                user.status !== "Rejected" &&
                                                                user.status !== "Ended" &&
                                                                user.status !== "Pending" && <Clock size={14} />}
                                                            {user.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="relative text-right break-words whitespace-normal">
                                                        <div className="flex space-x-2">

                                                            {/* ✅ Change User Role */}
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        title="Change User Role"
                                                                        className="cursor-pointer justify-start bg-transparent px-4 py-2 text-green-600 hover:bg-green-600 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700"
                                                                    >
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="flex items-center">
                                                                                        <FaUserCog />
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Change User Role</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </Button>
                                                                </PopoverTrigger>

                                                                <PopoverContent className="w-80 space-y-1 p-2">
                                                                    <div className="grid gap-4">
                                                                        <div className="px-4 py-2">
                                                                            <h4 className="font-medium leading-none">Change User Roles</h4>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                Set the role for the user.
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="px-4 py-2">
                                                                        <Select onValueChange={setUpdatedRole} value={updatedRole}>
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue placeholder="Select Role" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="President">President</SelectItem>
                                                                                <SelectItem value="Treasurer">Treasurer</SelectItem>
                                                                                <SelectItem value="Human Resource Officer">Human Resource Officer</SelectItem>
                                                                                <SelectItem value="Membership Committee">Membership Committee</SelectItem>
                                                                                <SelectItem value="Election Committee">Election Committee</SelectItem>
                                                                                <SelectItem value="Public Information Officer">Public Information Officer</SelectItem>
                                                                                <SelectItem value="Visitor">Visitor</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="px-4 py-2">
                                                                        <Button
                                                                            className="w-full cursor-pointer bg-green-600 text-white hover:bg-green-700"
                                                                            disabled={isUpdating}
                                                                            onClick={async () => {
                                                                                const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`;
                                                                                updateUserRole(user.id, fullName, updatedRole);
                                                                                setUpdatedRole("");
                                                                            }}
                                                                        >
                                                                            {isUpdating ? (
                                                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <CheckCircle className="h-5 w-5" />
                                                                            )}
                                                                            <span className="ml-2">Update Role</span>
                                                                        </Button>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>

                                                            {/* ✅ Change User Status */}
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        title="Change user status"
                                                                        className="cursor-pointer justify-start bg-transparent px-4 py-2 text-blue-600 hover:bg-blue-600 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700"
                                                                    >
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <span className="flex items-center">
                                                                                        <FaUserCheck />
                                                                                    </span>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Change User Status</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </Button>
                                                                </PopoverTrigger>

                                                                <PopoverContent className="w-80 space-y-1 p-2">
                                                                    <div className="px-4 py-2">
                                                                        <h4 className="font-medium leading-none">Update User Status</h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Approve or reject the user’s status.
                                                                        </p>
                                                                    </div>

                                                                    <div className="px-4 py-2">
                                                                        <Select onValueChange={setDecision} value={decision}>
                                                                            <SelectTrigger className="w-full">
                                                                                <SelectValue placeholder="Select Action" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="Approved">Approved</SelectItem>
                                                                                {user.status !== "Approved" && user.status !== "Ended" && (
                                                                                    <SelectItem value="Rejected">Rejected</SelectItem>
                                                                                )}
                                                                                {user.status === "Approved" && (
                                                                                    <SelectItem value="Ended">Ended</SelectItem>
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    <div className="px-4 py-2">
                                                                        <Button
                                                                            className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                                                                            disabled={isProcessing}
                                                                            onClick={async () => {
                                                                                const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`;
                                                                                processMembershipDecision(user.id, fullName, decision);
                                                                                setDecision("");
                                                                            }}
                                                                        >
                                                                            {isProcessing ? (
                                                                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                                                            ) : (
                                                                                <CheckCircle className="mr-2 h-5 w-5" />
                                                                            )}
                                                                            Update Status
                                                                        </Button>
                                                                    </div>
                                                                </PopoverContent>
                                                            </Popover>

                                                            {/* ✅ Delete User (only if Rejected) */}
                                                            {user.status === "Rejected" && (
                                                                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                                                    <DialogTrigger asChild>
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger asChild>
                                                                                    <Button
                                                                                        title="Delete user"
                                                                                        className="cursor-pointer justify-start bg-transparent px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                                                        onClick={() => setShowDeleteDialog(true)}
                                                                                    >
                                                                                        <FaTrash className="text-red-600 transition-colors duration-200 hover:text-red-800" />
                                                                                    </Button>
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>Delete User</TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    </DialogTrigger>

                                                                    <DialogContent>
                                                                        <DialogHeader>
                                                                            <DialogTitle>Delete User?</DialogTitle>
                                                                            <DialogDescription>
                                                                                Are you sure you want to permanently delete{" "}
                                                                                <span className="font-semibold">
                                                                                    {`${user.given_name} ${user.middle_name} ${user.last_name}`}
                                                                                </span>
                                                                                ? This action cannot be undone.
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <DialogFooter>
                                                                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                                                                Cancel
                                                                            </Button>
                                                                            <Button
                                                                                variant="destructive"
                                                                                onClick={() => {
                                                                                    const fullName = `${user.given_name} ${user.middle_name} ${user.last_name}`;
                                                                                    deleteUser(user.id, fullName);
                                                                                    setDecision("");
                                                                                    setShowDeleteDialog(false);
                                                                                }}
                                                                            >
                                                                                {isDeleting ? (
                                                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                                                ) : (
                                                                                    <CircleX className="mr-2 h-5 w-5" />
                                                                                )}
                                                                                Delete
                                                                            </Button>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
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

                {/* Success Dialog */}
                <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>User Role Update</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Member <strong>{successMessage}</strong> has updated their role.
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>OK</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}
