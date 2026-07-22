import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Toaster } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import SettingsAppLayout from '@/layouts/settings/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ArrowDownAZ, ArrowUpZA, CheckCircle, CircleX, Edit, LoaderCircle, Plus, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Form Settings',
        href: '/tacgeu/app-settings/department',
    },
];

interface departments {
    id: number;
    name: string;
}

interface UserPageProps {
    departments: {
        data: departments[];
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export default function Department() {
    const { departments } = usePage().props as unknown as UserPageProps;
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // Dialog states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [formName, setFormName] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchDepartment = (search = '', department = '') => {
        router.get(
            '/tacgeu/app-settings/department',
            {
                search,
                department,
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
            '/tacgeu/app-settings/department', // or use a static string like `/roles`
            {
                search: searchTerm,
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

    const handleFormSubmit = () => {
        setIsProcessing(true);
        if (!formName.trim()) {
            toast.error(`App Setting`, {
                description: `Department name is required.`,
                icon: <XCircle className="h-5 w-5 text-red-500" />,
            });
            setIsProcessing(false);
            return;
        }

        if (editId) {
            router.put(
                `/tacgeu/app-settings/department/${editId}`,
                { name: formName },
                {
                    onSuccess: () => {
                        toast.success(`App Setting`, {
                            description: `Department updated successfully.`,
                            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        });
                        setIsFormOpen(false);
                        setIsProcessing(false);
                    },
                },
            );
        } else {
            router.post(
                '/tacgeu/app-settings/department',
                { name: formName },
                {
                    onSuccess: () => {
                        toast.success(`App Setting`, {
                            description: `Department added successfully.`,
                            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        });
                        setIsFormOpen(false);
                        setIsProcessing(false);
                    },
                },
            );
        }
    };

    const handleDelete = () => {
        setIsDeleting(true);
        if (deleteId) {
            router.delete(`/tacgeu/app-settings/department/${deleteId}`, {
                onSuccess: () => {
                    toast.success(`App Setting`, {
                        description: `Department has been permanently removed.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    });
                    setIsDeleting(false);
                    setIsDeleteOpen(false);
                },
            });
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Department settings" />

                <SettingsAppLayout>
                    <div className="space-y-6">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">Departments</h1>
                            <Button
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                onClick={() => {
                                    setEditId(null);
                                    setFormName('');
                                    setIsFormOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                Add Department
                            </Button>
                        </div>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Input
                                placeholder="Search by department..."
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    fetchDepartment(value, selectedDepartment);
                                }}
                                className="w-full"
                            />
                        </div>
                        {/* Table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        #
                                        {sortBy === 'given_name' &&
                                            (sortDirection === 'asc' ? (
                                                <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                            ) : (
                                                <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                            ))}
                                    </TableHead>
                                    <TableHead>Department Name</TableHead>
                                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {departments.data.length > 0 ? (
                                    departments.data.map((dept, index) => (
                                        <TableRow key={dept.id}>
                                            <TableCell>{dept.id}</TableCell>
                                            <TableCell>{dept.name}</TableCell>
                                            <TableCell className="flex items-center justify-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setEditId(dept.id);
                                                                    setFormName(dept.name);
                                                                    setIsFormOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Department</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 hover:text-red-600"
                                                                onClick={() => {
                                                                    setDeleteId(dept.id);
                                                                    setIsDeleteOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Remove Department</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-gray-500">
                                            No departments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination Controls */}
                    {departments && departments.links && departments.links.length > 3 && (
                        <Pagination className="mt-6">
                            <PaginationContent>
                                {departments.links.map((link, index) => (
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
                    {/* Add/Edit Dialog */}
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editId ? 'Edit Department' : 'Add Department'}</DialogTitle>
                                <DialogDescription>{editId ? 'Update the department name.' : 'Enter a new department name.'}</DialogDescription>
                            </DialogHeader>
                            <Input placeholder="Department name" value={formName} onChange={(e) => setFormName(e.target.value)} />
                            <DialogFooter>
                                <Button variant="outline" className="hover:bg-red-500" onClick={() => setIsFormOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    disabled={isProcessing}
                                    className="cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                    onClick={handleFormSubmit}
                                >
                                    {isProcessing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                    {editId ? 'Update' : 'Add'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation */}
                    <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Department</DialogTitle>
                                <DialogDescription>Are you sure you want to delete this department? This action cannot be undone.</DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                    {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <CircleX className="mr-2 h-5 w-5" />}
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </SettingsAppLayout>
            </AppLayout>
        </>
    );
}
