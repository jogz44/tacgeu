import Heading from '@/components/heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/date';
import { User, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown01, ArrowDownAZ, ArrowUp10, ArrowUpZA, CheckCircle, CircleX, LoaderCircle, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaPlusCircle, FaRedo } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import ExportAnnouncementPDF from '../report/pdf/ExportAnnouncementPDF';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Announcement',
        href: '/tacgeu/announcement',
    },
];

export default function expenses() {
    const { announcements } = usePage().props as unknown as AnnouncementPageProps;
    const { filteredType } = usePage().props;
    const users: User[] = (usePage().props.users as User[]) || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [enabled, setEnabled] = useState(true);
    const { auth } = usePage().props as any;
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [open, setOpen] = useState(false);
    const [userSearch, setUserSearch] = useState('');
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    const toggleExpanded = (id: number) => {
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const title =
        filteredType === 'Announcements'
            ? 'Announcements'
            : filteredType === 'Meetings'
              ? 'Meeting Schedules'
              : filteredType === 'Programs'
                ? 'Program Offers'
                : 'Events Schedules';
    // Define the Expenses interface
    interface Announcement {
        id: number;
        user: User;
        image: string;
        title: string;
        body: string;
        type: string;
        status: string;
        scheduled_at: string;
        created_at: string;
    }

    interface AnnouncementPageProps {
        announcements: {
            data: Announcement[];
            current_page: number;
            last_page: number;
            links: {
                url: string | null;
                label: string;
                active: boolean;
            }[];
        };
    }

    const { data, setData, post, processing, reset } = useForm({
        image: '' as string | File | null,
        title: '',
        body: '',
        type: '',
        status: 'inactive',
        created_at: '',
        scheduled_at: '',
    });

    const fullName = [auth.user.given_name, auth.user.middle_name, auth.user.last_name, auth.user.suffix].filter(Boolean).join(' ');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            setImageFile(file);
        } else {
            alert('Only image files are allowed');
        }
    }, []);

    // Sync dropped image file to the form data
    useEffect(() => {
        setData('image', imageFile);
    }, [imageFile, setData]);

    useEffect(() => {
        if (!imageFile) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(imageFile);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/gif': [],
            'image/webp': [],
        },
        maxFiles: 1,
    });

    const fetchAnnouncement = (search = '') => {
        router.get(
            '/tacgeu/announcement',
            {
                search,
                type: filteredType as string,
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
            '/tacgeu/announcement',
            {
                search: searchTerm,
                type: filteredType as string,
                sortBy: field,
                direction: newDirection,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSaveAnnouncement = () => {
        setIsSaving(true);
        if (!data.title || !data.body || !data.type || !data.scheduled_at) {
            setHasAttemptedSubmit(true);
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('body', data.body);
        formData.append('type', data.type);
        formData.append('status', data.status);
        formData.append('scheduled_at', data.scheduled_at);
        formData.append('published_at', data.created_at);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (isEditing && editingId) {
            // Update existing announcement
            formData.append('_method', 'PUT');
            router.post(route('announcements.update', editingId), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setOpen(false);
                    toast.success('Announcement Updated', {
                        description: 'Announcement has been updated successfully.',
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 2500,
                    });
                    reset();
                    setImageFile(null);
                    setPreview(null);
                    setUserSearch('');
                    setHasAttemptedSubmit(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setIsSaving(false);
                },
                onError: (errors) => {
                    setIsSaving(false);
                    toast.error('Error', {
                        description: Object.values(errors).flat().join('\n'),
                        icon: <CircleX className="h-5 w-5 text-red-600" />,
                        duration: 3500,
                    });
                    console.error(Object.values(errors).flat().join('\n'));
                },
            });
        } else {
            // Create new announcement
            router.post(route('announcements.store'), formData, {
                forceFormData: true,
                onSuccess: () => {
                    setOpen(false);
                    toast.success('New Announcement', {
                        description: 'New Announcement has been recorded.',
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                        duration: 2500,
                    });
                    reset();
                    setImageFile(null);
                    setPreview(null);
                    setUserSearch('');
                    setHasAttemptedSubmit(false);
                    setIsSaving(false);
                },
                onError: (errors) => {
                    setIsSaving(false);
                    toast.error('Error', {
                        description: Object.values(errors).flat().join('\n'),
                        icon: <CircleX className="h-5 w-5 text-red-600" />,
                        duration: 3500,
                    });
                    console.error(Object.values(errors).flat().join('\n'));
                },
            });
        }
    };

    const handleDelete = () => {
        if (!selectedAnnouncement?.id) return;
        setIsDeleting(true);
        router.delete(route('announcements.destroy', selectedAnnouncement.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                toast.success('Announcement deleted', {
                    description: 'The announcement has been successfully deleted.',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2500,
                });
                setIsDeleting(false);
            },
            onError: (errors) => {
                toast.error('Delete failed', {
                    description: Object.values(errors).flat().join('\n'),
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 2500,
                });
                setIsDeleting(false);
            },
        });
    };

    const openImageModal = (imagePath: string) => {
        setSelectedImage(imagePath);
        setIsImageOpen(true);
    };

    const closeImageModal = () => {
        setIsImageOpen(false);
        setSelectedImage(null);
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Announcements" />
                <div className="flex h-full w-full flex-col gap-6 p-6">
                    <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
                        <PlaceholderPattern className="absolute inset-0 h-full w-full stroke-neutral-300/10 dark:stroke-neutral-100/10" />

                        <div className="relative z-10 space-y-6 p-6">
                            <Heading title={title} description="Programs, events, programs and updates shared by the TACGEU." />

                            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                                <div className="flex w-full gap-4 md:max-w-md">
                                    <Input
                                        placeholder="Search by title or description..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSearchTerm(value);
                                            fetchAnnouncement(value);
                                        }}
                                    />
                                    <Button
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setSearchTerm('');
                                            fetchAnnouncement('');
                                        }}
                                    >
                                        <FaRedo className="mr-2" />
                                        Reset
                                    </Button>
                                </div>
                                {(auth?.user?.role === 'President' || auth?.user?.role === 'Public Information Officer') && (
                                    <>
                                        <Button
                                            className="ml-auto cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                            onClick={() => setOpen(true)}
                                        >
                                            <FaPlusCircle className="h-4 w-4" /> News & Updates
                                        </Button>
                                        <ExportAnnouncementPDF
                                            data={
                                                announcements?.data?.map((item) => [
                                                    item.title,
                                                    item.body,
                                                    formatDate(item.scheduled_at),
                                                    formatDate(item.created_at),
                                                ]) ?? []
                                            }
                                            title={title}
                                            subTitle=""
                                            colHeaders={['Title', 'Description', 'Scheduled Date', 'Date Posted']}
                                            preparedBy={fullName}
                                            role={auth.user.role}
                                        />
                                    </>
                                )}
                            </div>

                            <div className="w-full overflow-x-auto rounded-lg border dark:border-gray-800">
                                <Table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <TableHeader className="bg-teal-600 dark:bg-teal-700">
                                        <TableRow>
                                            <TableHead className="text-sm tracking-wider break-words whitespace-normal text-white">Image</TableHead>
                                            <TableHead
                                                className="cursor-pointertext-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('title')}
                                            >
                                                Title
                                                {sortBy === 'title' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('body')}
                                            >
                                                Description
                                                {sortBy === 'body' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDownAZ className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUpZA className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>
                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('scheduled_at')}
                                            >
                                                Scheduled Date
                                                {sortBy === 'scheduled_at' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>

                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
                                                onClick={() => handleSort('published_at')}
                                            >
                                                Date Posted
                                                {sortBy === 'published_at' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowDown01 className="ml-1 inline h-4 w-4" />
                                                    ) : (
                                                        <ArrowUp10 className="ml-1 inline h-4 w-4" />
                                                    ))}
                                            </TableHead>

                                            <TableHead
                                                className="cursor-pointer text-sm tracking-wider break-words whitespace-normal text-white hover:bg-teal-700 dark:text-gray-300 dark:hover:bg-teal-600"
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
                                            {(auth?.user?.role === 'President' || auth?.user?.role === 'Public Information Officer') && (
                                                <TableHead className="text-sm">{/* Your <TableRow> or <TableHeader> content here */}</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-white dark:bg-gray-900">
                                        {announcements.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={auth?.user?.role === 'President' ? 6 : 5}
                                                    className="py-8 text-center text-sm text-gray-500"
                                                >
                                                    No {title}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            announcements.data.map((announcement) => (
                                                <TableRow key={announcement.id} className="transition hover:bg-gray-100 dark:hover:bg-gray-800">
                                                    <TableCell>
                                                        {announcement.image ? (
                                                            <img
                                                                src={`/storage/${announcement.image}`}
                                                                alt="Announcement"
                                                                className="h-12 w-12 cursor-pointer rounded object-cover transition hover:opacity-80"
                                                                onClick={() => {
                                                                    setSelectedImage(`/storage/${announcement.image}`);
                                                                    setIsImageOpen(true);
                                                                }}
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.style.display = 'none';
                                                                    const parent = e.currentTarget.parentNode;
                                                                    if (parent) {
                                                                        const brokenText = parent.querySelector(
                                                                            '.broken-image-text',
                                                                        ) as HTMLElement | null;
                                                                        if (brokenText) {
                                                                            brokenText.style.display = 'block';
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            'No Image'
                                                        )}
                                                        <span className="broken-image-text hidden text-sm text-red-500">No Image</span>
                                                    </TableCell>
                                                    <TableCell className="text-sm break-words whitespace-normal text-gray-900 dark:text-gray-100">
                                                        {announcement.title}
                                                    </TableCell>
                                                    <TableCell className="max-w-xs min-w-[150px] text-sm break-words whitespace-normal text-gray-600 dark:text-gray-300">
                                                        {(() => {
                                                            const isExpanded = expandedIds.includes(announcement.id);
                                                            const maxLength = 120;
                                                            const body = announcement.body || '';

                                                            const shouldTruncate = body.length > maxLength;
                                                            const displayText =
                                                                isExpanded || !shouldTruncate ? body : body.slice(0, maxLength) + '...';

                                                            return (
                                                                <>
                                                                    <span>{displayText}</span>

                                                                    {shouldTruncate && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => toggleExpanded(announcement.id)}
                                                                            className="ml-1 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                                        >
                                                                            {isExpanded ? 'Read less' : 'Read more'}
                                                                        </button>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDate(announcement.scheduled_at)}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDate(announcement.created_at)}
                                                    </TableCell>
                                                    <TableCell className="text-sm break-words whitespace-normal text-gray-600 dark:text-gray-300">
                                                        {(() => {
                                                            const now = new Date();
                                                            const scheduledDate = new Date(announcement.scheduled_at);
                                                            let dynamicStatus = '';

                                                            if (scheduledDate > now) {
                                                                dynamicStatus = 'Upcoming';
                                                            } else {
                                                                dynamicStatus = 'Completed';
                                                            }

                                                            const statusColor =
                                                                dynamicStatus === 'Upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white';

                                                            return <Badge className={statusColor}>{dynamicStatus}</Badge>;
                                                        })()}
                                                    </TableCell>
                                                    {/* <TableCell className="text-sm break-words whitespace-normal text-gray-600 dark:text-gray-300">
                                                        <Badge
                                                            className={
                                                                announcement.status === 'active'
                                                                    ? 'bg-green-500 text-white'
                                                                    : 'bg-gray-400 text-white'
                                                            }
                                                        >
                                                            {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                                                        </Badge>
                                                    </TableCell> */}
                                                    {(auth?.user?.role === 'President' || auth?.user?.role === 'Public Information Officer') && (
                                                        <TableCell>
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    title="Update Announcement"
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="cursor-pointer"
                                                                    onClick={() => {
                                                                        setIsEditing(true);
                                                                        setEditingId(String(announcement.id));
                                                                        setData({
                                                                            image: null, // reset or load if you want preview separately
                                                                            title: announcement.title,
                                                                            body: announcement.body,
                                                                            type: announcement.type,
                                                                            status: announcement.status,
                                                                            scheduled_at: announcement.scheduled_at,
                                                                            created_at: announcement.created_at || '',
                                                                        });
                                                                        setPreview(announcement.image ? `/storage/${announcement.image}` : null);
                                                                        setImageFile(null);
                                                                        setEnabled(announcement.status === 'active'); // if using separate enabled state for switch
                                                                        setOpen(true);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    title="Delete Announcement"
                                                                    variant="destructive"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setSelectedAnnouncement(announcement);
                                                                        setShowDeleteModal(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {announcements && announcements.links && announcements.links.length > 3 && (
                                <Pagination className="mt-6">
                                    <PaginationContent>
                                        {announcements.links.map((link, index) => (
                                            <PaginationItem key={index}>
                                                {link.url ? (
                                                    <PaginationLink
                                                        onClick={() => router.visit(link.url!)}
                                                        isActive={link.active}
                                                        className={`px-3 py-1 ${link.active ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                                    >
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    </PaginationLink>
                                                ) : (
                                                    <span className="cursor-not-allowed text-gray-400">
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

                {/* Announcement Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Update Announcement' : 'New Announcement'}</DialogTitle>
                            <DialogDescription>
                                {isEditing
                                    ? 'Edit the announcement details and save.'
                                    : 'Fill out the form to add a new announcement, meeting, event, or program.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={(data.status || 'inactive') === 'active'}
                                    onCheckedChange={(checked) => setData({ ...data, status: checked ? 'active' : 'inactive' })}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">{data.status === 'active' ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                        {!data.status && hasAttemptedSubmit && <p className="text-sm text-red-500">Status is required.</p>}
                        {/* Title */}

                        <div className="flex items-center space-x-4">
                            <Label htmlFor="title" className="w-24 text-sm font-medium text-gray-700">
                                Title
                            </Label>
                            <Input
                                id="title"
                                type="text"
                                placeholder="Title"
                                value={data.title}
                                onChange={(e) => setData({ ...data, title: e.target.value })}
                                className="flex-1"
                            />
                        </div>
                        {!data.title && hasAttemptedSubmit && <p className="text-sm text-red-500">Title is required.</p>}

                        {/* Description */}
                        <div className="flex items-start space-x-4">
                            <Label htmlFor="description" className="w-24 pt-1 text-sm font-medium text-gray-700">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Description"
                                value={data.body}
                                onChange={(e) => setData({ ...data, body: e.target.value })}
                                className="flex-1"
                            />
                        </div>
                        {!data.body && hasAttemptedSubmit && <p className="text-sm text-red-500">Description is required.</p>}

                        {/* Type */}
                        <div className="flex items-center space-x-4">
                            <Label htmlFor="type" className="w-24 text-sm font-medium text-gray-700">
                                Type
                            </Label>
                            <Select value={data.type} onValueChange={(value) => setData({ ...data, type: value })}>
                                <SelectTrigger id="type" className="w-full flex-1">
                                    <SelectValue placeholder="Select a type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Announcements">Announcements</SelectItem>
                                    <SelectItem value="Events">Events</SelectItem>
                                    <SelectItem value="Meetings">Meeting</SelectItem>
                                    <SelectItem value="Programs">Programs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {!data.type && hasAttemptedSubmit && <p className="text-sm text-red-500">Event type is required.</p>}

                        {/* Scheduled Date */}
                        <div className="flex items-center space-x-4">
                            <Label htmlFor="scheduled_at" className="w-24 text-sm font-medium text-gray-700">
                                Date
                            </Label>
                            <Input
                                id="scheduled_at"
                                type="date"
                                value={data.scheduled_at ? data.scheduled_at.split(' ')[0] : ''}
                                onChange={(e) => setData({ ...data, scheduled_at: e.target.value })}
                                className="flex-1"
                            />
                        </div>
                        {!data.scheduled_at && hasAttemptedSubmit && <p className="text-sm text-red-500">Date is required.</p>}
                        {/* Image Upload */}
                        <label htmlFor="image" className="text-sm font-medium">
                            Upload Image
                        </label>
                        <div
                            {...getRootProps()}
                            id="image-dropzone"
                            className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-4 py-6 text-sm ${
                                isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
                            }`}
                            style={{
                                backgroundImage: preview ? `url(${preview})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                height: '150px', // fix height so the image area is visible
                            }}
                        >
                            <input {...getInputProps()} id="image" />
                            {!preview && (
                                <>
                                    {imageFile ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{imageFile.name}</p>
                                    ) : isDragActive ? (
                                        <p>Drop the image here ...</p>
                                    ) : (
                                        <p>Drag 'n' drop an image here, or click to select one</p>
                                    )}
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>

                            {/* SAVE BUTTON → opens confirmation */}
                            <Button
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => {
                                    setHasAttemptedSubmit(true);
                                    setShowSaveConfirm(true);
                                }}
                                disabled={isSaving}
                            >
                                Save
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* DELETE CONFIRMATION */}
                <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">Delete Announcement</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. Are you sure?</AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 text-white hover:bg-red-700">
                                {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* ✅ Modal Section */}
                <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
                    <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-[700px]">
                        {selectedImage && (
                            <div className="relative">
                                <img src={selectedImage} alt="Full Announcement" className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain" />
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* SAVE CONFIRMATION */}
                <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{isEditing ? 'Confirm Update' : 'Confirm Save'}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {isEditing
                                    ? 'Are you sure you want to update this announcement?'
                                    : 'Are you sure you want to create this announcement?'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSaveAnnouncement} disabled={isSaving}>
                                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Confirm'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}
