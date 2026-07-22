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
        href: '/tacgeu/app-settings/position',
    },
];

interface positions {
    id: number;
    title: string;
}

interface UserPageProps {
    positions: {
        data: positions[];
        current_page: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export default function EmployeePosition() {
    const { positions } = usePage().props as unknown as UserPageProps;
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

    const fetchPosition = (search = '', department = '') => {
        router.get(
            '/tacgeu/app-settings/position',
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
            '/tacgeu/app-settings/position', // or use a static string like `/roles`
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
                description: `Position title is required.`,
                icon: <XCircle className="h-5 w-5 text-red-500" />,
            });
            setIsProcessing(false);
            return;
        }

        if (editId) {
            router.put(
                `/tacgeu/app-settings/position/${editId}`,
                { title: formName },
                {
                    onSuccess: () => {
                        toast.success(`App Setting`, {
                            description: `Position updated successfully.`,
                            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        });
                        setIsFormOpen(false);
                        setIsProcessing(false);
                    },
                    onError: (error) => {
                        toast.error(`App Setting`, {
                            description: `Failed to update position.`,
                            icon: <XCircle className="h-5 w-5 text-red-500" />,
                        });
                        setIsProcessing(false);
                        console.log(error);
                    },
                },
            );
        } else {
            router.post(
                '/tacgeu/app-settings/position',
                { title: formName },
                {
                    onSuccess: () => {
                        toast.success(`App Setting`, {
                            description: `Position added successfully.`,
                            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        });
                        setIsFormOpen(false);
                        setIsProcessing(false);
                    },
                    onError: (error) => {
                        toast.error(`App Setting`, {
                            description: `Failed to add position.`,
                            icon: <XCircle className="h-5 w-5 text-red-500" />,
                        });
                        console.log(error);
                        setIsProcessing(false);
                    },
                },
            );
        }
    };

    const handleDelete = () => {
        setIsDeleting(true);
        if (deleteId) {
            router.delete(`/tacgeu/app-settings/position/${deleteId}`, {
                onSuccess: () => {
                    toast.success(`App Setting`, {
                        description: `Position has been permanently removed.`,
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
                <Head title="Position settings" />

                <SettingsAppLayout>
                    <div className="space-y-6">
                        {/* Top Bar */}
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold">Positions</h1>
                            <Button
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-green-600 text-white transition-colors duration-200 hover:bg-green-700"
                                onClick={() => {
                                    setEditId(null);
                                    setFormName('');
                                    setIsFormOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4" />
                                Add Position
                            </Button>
                        </div>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <Input
                                placeholder="Search by position..."
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    fetchPosition(value, selectedDepartment);
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
                                    <TableHead>Position Title</TableHead>
                                    <TableHead className="w-[100px] text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {positions.data.length > 0 ? (
                                    positions.data.map((pos, index) => (
                                        <TableRow key={pos.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{pos.title}</TableCell>
                                            <TableCell className="flex items-center justify-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    setEditId(pos.id);
                                                                    setFormName(pos.title);
                                                                    setIsFormOpen(true);
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Position</TooltipContent>
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
                                                                    setDeleteId(pos.id);
                                                                    setIsDeleteOpen(true);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Remove Position</TooltipContent>
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
                    {positions && positions.links && positions.links.length > 3 && (
                        <Pagination className="mt-6">
                            <PaginationContent>
                                {positions.links.map((link, index) => (
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
                                <DialogTitle>{editId ? 'Edit Position' : 'Add Position'}</DialogTitle>
                                <DialogDescription>{editId ? 'Update the position title.' : 'Enter a new position title.'}</DialogDescription>
                            </DialogHeader>
                            <Input placeholder="Position title" value={formName} onChange={(e) => setFormName(e.target.value)} />
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
                                <DialogTitle>Delete Position</DialogTitle>
                                <DialogDescription>Are you sure you want to delete this position? This action cannot be undone.</DialogDescription>
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
