import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, EditIcon, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/tacgeu/app-settings',
    },
];

interface AppSettings {
    id: number;
    key: string;
    value: string;
    type: string;
}

interface Props {
    app_setting: AppSettings[];
}

export default function AppSettings({ app_setting }: Props) {
    const [settings, setSettings] = useState(app_setting);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState<AppSettings | null>(null);
    const [editedValue, setEditedValue] = useState('');

    const handleEditClick = (setting: AppSettings) => {
        setEditingSetting(setting);
        setEditedValue(setting.value);
        setEditDialogOpen(true);
    };

    const handleSave = () => {
        if (!editingSetting) return;

        router.post(
            `/app-settings/update/${editingSetting.id}`,
            {
                value: editedValue,
            },
            {
                onSuccess: () => {
                    setSettings((prev) => prev.map((s) => (s.id === editingSetting.id ? { ...s, value: editedValue } : s)));
                    setEditDialogOpen(false);
                    toast.success(`Application Settings`, {
                        description: `The new settings have been successfully applied.`,
                        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    });
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat().join(' ') || 'An unexpected error occurred.';
                    toast.error('Application Settings Error', {
                        description: errorMessages,
                        icon: <XCircle className="h-5 w-5 text-red-500" />,
                    });
                }
            },
        );

        const updatedSettings = settings.map((s) => (s.id === editingSetting.id ? { ...s, value: editedValue } : s));

        setSettings(updatedSettings);
        setEditDialogOpen(false);
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Application Settings" />
                <div className="flex h-full flex-col gap-4 rounded-xl p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border py-6 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            <Heading
                                title="Application Settings"
                                description="Manage and configure system-wide preferences, defaults, and operational rules for the application."
                            />
                            <div className="-mt-6 bg-white p-4 dark:bg-gray-900">
                                <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                    <li>
                                        <strong>Boolean:</strong> 1 = True / Yes / Enabled, 0 = False / No / Disabled
                                    </li>
                                    <li>
                                        <strong>Integer:</strong> May represent % (percentage), number of months, or number of years
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="relative z-10 space-y-4 px-4">
                            <div className="overflow-x-auto rounded-lg border bg-white px-4 py-4 dark:bg-gray-800">
                                <Table className="w-full table-auto border-collapse text-sm">
                                    <TableHeader>
                                        <TableRow className="border-b text-left text-gray-600 dark:text-gray-300">
                                            <TableHead>Key</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {settings.map((setting) => (
                                            <TableRow key={setting.id} className="border-b last:border-none dark:border-gray-700">
                                                <TableCell>{setting.key}</TableCell>
                                                <TableCell>
                                                    {setting.type === 'time'
                                                        ? new Date(`1970-01-01T${setting.value}`).toLocaleTimeString([], {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })
                                                        : setting.value}
                                                </TableCell>
                                                <TableCell className="capitalize">{setting.type}</TableCell>
                                                <TableCell className="text-center">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="group hover:text-white"
                                                                    onClick={() => handleEditClick(setting)}
                                                                >
                                                                    <EditIcon className="h-4 w-4 text-[#06558AFF] group-hover:text-white" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top">Edit Application Setting</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Setting</DialogTitle>
                        </DialogHeader>

                        {editingSetting && (
                            <div className="flex flex-col gap-4 py-2">
                                <Label htmlFor="settingValue">
                                    Value for{' '}
                                    <Badge
                                        className={
                                            editingSetting.type === 'time'
                                                ? 'bg-blue-100 text-blue-800'
                                                : editingSetting.type === 'int'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }
                                    >
                                        {editingSetting.key}
                                    </Badge>
                                </Label>
                                <Input
                                    id="settingValue"
                                    type={editingSetting.type === 'int' ? 'number' : editingSetting.type}
                                    value={editedValue}
                                    onChange={(e) => setEditedValue(e.target.value)}
                                />
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
