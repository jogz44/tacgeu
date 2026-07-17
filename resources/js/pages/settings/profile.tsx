import DeleteUser from '@/components/delete-user';
import ResignUser from '@/components/resign-user';
import ReactivateUser from '@/components/reactivate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, CircleX } from 'lucide-react';
import { FormEventHandler, useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast, Toaster } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile Settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    id: number;
    image: File | string | null;
    last_name: string;
    given_name: string;
    middle_name: string;
    suffix: string;
    nickname: string;
    house_address: string;
    region: string;
    province: string;
    city: string;
    barangay: string;
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

    status?: string;
    documents: File | string | null;
};

type ClusterData = Record<
    string,
    {
        region_name: string;
        province_list: Record<
            string,
            {
                municipality_list: Record<
                    string,
                    {
                        barangay_list: string[];
                    }
                >;
            }
        >;
    }
>;

interface Position {
    id: number;
    title: string;
}

interface Department {
    id: number;
    name: string;
}

const salaryGrades = Array.from({ length: 22 }, (_, i) => (i + 1).toString());

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [emailStatus, setEmailStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [locationData, setLocationData] = useState<any[]>([]);
    const [cluster, setCluster] = useState<ClusterData>({});
    const [regionOptions, setRegionOptions] = useState<string[]>([]);
    const [provinceOptions, setProvinceOptions] = useState<string[]>([]);
    const [municipalityOptions, setMunicipalityOptions] = useState<string[]>([]);
    const [barangayOptions, setBarangayOptions] = useState<string[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const isReadOnly = auth.user.status === 'Approved';
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        id: auth.user.id,
        image: auth.user.image || '',
        last_name: auth.user.last_name || '',
        given_name: auth.user.given_name || '',
        middle_name: auth.user.middle_name || '',
        suffix: auth.user.suffix || '',
        nickname: auth.user.nickname || '',

        house_address: auth.user.house_address || '',
        region: auth.user.region || '',
        province: auth.user.province || '',
        city: auth.user.city || '',
        barangay: auth.user.barangay || '',
        contact_number: auth.user.contact_number || '',
        email: auth.user.email || '',

        birthdate: auth.user.birthdate || '',
        birthplace: auth.user.birthplace || '',
        sex: auth.user.sex || '',
        civil_status: auth.user.civil_status || '',
        spouse_name: auth.user.spouse_name || '',
        religion: auth.user.religion || '',

        education: auth.user.education || '',
        college_degree: auth.user.college_degree || '',
        postgrad_degree: auth.user.postgrad_degree || '',

        position: auth.user.position || '',
        salary_grade: auth.user.salary_grade || '',
        office: auth.user.office || '',

        status: auth.user.status || '',

        physically_challenged: !!auth.user.physically_challenged,
        solo_parent: !!auth.user.solo_parent,
        adoptive_couple: !!auth.user.adoptive_couple,
        documents: auth.user.documents ?? null,
    });

    useEffect(() => {
         fetch(`${window.APP_BASE_URL}assets/json/cluster.json`)
            .then((res) => res.json())
            .then((json: ClusterData) => {
                setCluster(json);
                // Extract region names from JSON
                const regionNames = Object.values(json).map((region: any) => region.region_name);
                setRegionOptions(regionNames.sort());
            });
    }, []);

    const getRegionKeyByName = (regionName: string): string | undefined => {
        return Object.keys(cluster).find((key) => cluster[key].region_name === regionName);
    };

    // When region changes, update provinces
    useEffect(() => {
        const timeout = setTimeout(() => {
            const regionKey = getRegionKeyByName(data.region);

            if (data.region && regionKey && cluster[regionKey]) {
                const provinces = Object.keys(cluster[regionKey].province_list);
                setProvinceOptions(provinces);

                if (!provinces.includes(data.province)) {
                    setData('province', provinces.includes(auth.user.province) ? auth.user.province : '');
                    setData('city', '');
                    setData('barangay', '');
                }
            } else {
                setProvinceOptions([]);
                setData('province', '');
                setData('city', '');
                setData('barangay', '');
            }
        }, 300); // 👈 300ms delay

        return () => clearTimeout(timeout);
    }, [data.region, cluster]);

    // When province changes, update municipalities
    useEffect(() => {
        const timeout = setTimeout(() => {
            const regionKey = getRegionKeyByName(data.region);

            if (data.region && data.province && regionKey && cluster[regionKey]?.province_list[data.province]) {
                const municipalities = Object.keys(cluster[regionKey].province_list[data.province].municipality_list);
                setMunicipalityOptions(municipalities);

                if (!municipalities.includes(data.city)) {
                    setData('city', municipalities.includes(auth.user.city) ? auth.user.city : '');
                    setData('barangay', '');
                }
            } else {
                setMunicipalityOptions([]);
                setData('city', '');
                setData('barangay', '');
            }
        }, 500); // 👈 400ms delay

        return () => clearTimeout(timeout);
    }, [data.region, data.province, cluster]);

    // When municipality changes, update barangays
    useEffect(() => {
        const timeout = setTimeout(() => {
            const regionKey = getRegionKeyByName(data.region);

            if (
                data.region &&
                data.province &&
                data.city &&
                regionKey &&
                cluster[regionKey]?.province_list[data.province]?.municipality_list[data.city]
            ) {
                const barangays = cluster[regionKey].province_list[data.province].municipality_list[data.city].barangay_list;
                setBarangayOptions(barangays);

                if (!barangays.includes(data.barangay)) {
                    setData('barangay', barangays.includes(auth.user.barangay) ? auth.user.barangay : '');
                }
            } else {
                setBarangayOptions([]);
                setData('barangay', '');
            }
        }, 700); // 👈 500ms delay

        return () => clearTimeout(timeout);
    }, [data.region, data.province, data.city, cluster]);

    const checkEmail = async () => {
        if (!data.email) return;

        setEmailStatus('checking');
        setEmailError(null);

        try {
            const response = await axios.get(route('email.check'), {
                params: { email: data.email, exclude_id: data.id },
            });

            if (response.data.valid) {
                setEmailStatus('available');
            } else {
                setEmailStatus('taken');
                setEmailError(response.data.message);
            }
        } catch (error) {
            setEmailError('Could not verify email. Try again.');
            setEmailStatus(null);
        }
    };

    useEffect(() => {
        const fetchPosition = async () => {
            const response = await axios.get('/position');
            const data = Array.isArray(response.data) ? response.data : [];
            setPositions(data);
        };

        const fetchDepartment = async () => {
            const response = await axios.get('/department');
            const data = Array.isArray(response.data) ? response.data : [];
            setDepartments(data);
        };
        fetchPosition();
        fetchDepartment();

    }, []);

    // 1. IMAGE DROPZONE
    const onImageDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
            setImageFile(file);
        } else {
            toast.error(`Image Upload`, {
                description: 'Only image files are allowed',
                icon: <CircleX className="h-5 w-5 text-red-500" />,
                duration: 2000,
                position: 'top-right',
            });
        }
    }, []);

    const {
        getRootProps: getImageRootProps,
        getInputProps: getImageInputProps,
        isDragActive: isImageDragActive,
    } = useDropzone({
        onDrop: onImageDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/gif': [],
            'image/webp': [],
        },
        maxFiles: 1,
    });

    // Sync image to form data
    useEffect(() => {
        if (imageFile) {
            setData('image', imageFile);
        }
    }, [imageFile, setData]);

    useEffect(() => {
        if (imageFile) {
            // New uploaded image
            const objectUrl = URL.createObjectURL(imageFile);
            setPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof data.image === 'string' && data.image !== '') {
            // Existing image path from backend
            setPreview(`/storage/${data.image}`);
        } else {
            setPreview(null);
        }
    }, [imageFile, data.image]);

    // 2. PDF DROPZONE
    const onPdfDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0];
        if (pdfFile && pdfFile.type === 'application/pdf') {
            const uniqueName = `${Date.now()}_${pdfFile.name}`;
            const renamedFile = new File([pdfFile], uniqueName, { type: pdfFile.type });
            setData('documents', renamedFile);
        } else {
            alert('Only PDF files are allowed.');
        }
    }, []);

    const {
        getRootProps: getPdfRootProps,
        getInputProps: getPdfInputProps,
        isDragActive: isPdfDragActive,
    } = useDropzone({
        onDrop: onPdfDrop,
        accept: { 'application/pdf': [] },
        maxFiles: 1,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const formData = new FormData();

        // Append all form fields to FormData
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                if (key === 'image') {
                    if (value instanceof File) {
                        formData.append('image', value);
                    }
                    // else: don't append if it's just a string
                } else if (typeof value === 'boolean') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, String(value));
                }
            }
        });

        router.post(route('profile.update'), formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success(`Profile Update`, {
                    description: `Profile is updated successfully.`,
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 2000,
                    position: 'top-right',
                });
            },
            onError: (errors: Record<string, string[] | string>) => {
                const messages = Object.values(errors)
                    .flat() // combine multiple field errors into one array
                    .join(', '); // turn it into a single string

                toast.error('Error', {
                    description: messages,
                    icon: <CircleX className="h-5 w-5 text-red-500" />,
                    duration: 3000,
                    position: 'top-right',
                });
            },
        });
    };

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Profile settings" />

                <SettingsLayout>
                    <div className="space-y-6">
                        {/* <HeadingSmall title="Profile information" description="Update your personal details" /> */}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Profile Picture Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <div {...getImageRootProps()} id="image-dropzone"
                                    className={
                                        'group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-all duration-300 hover:shadow-lg ' +
                                        (isImageDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800')
                                    }
                                    style={{
                                        backgroundImage: preview ? `url(${preview})` : undefined,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        width: '160px',
                                        height: '160px',
                                    }}
                                >
                                    <input {...getImageInputProps()} id="image" disabled={isReadOnly} /> {/* Hover overlay if preview exists */}

                                    {preview && (
                                        <div className="absolute inset-0 z-10 hidden items-center justify-center
                                        rounded-full bg-black/50 text-white group-hover:flex">
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                className="h-6 w-6 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor" >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>)} {/* Fallback if no preview */}
                                    {!preview && (
                                        <div className="z-0 flex flex-col items-center px-2 text-center text-xs
                                        text-gray-500 dark:text-gray-300">
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                className="mb-1 h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor" >
                                                <path strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            {imageFile ? imageFile.name : isImageDragActive ? 'Drop image here' : 'Click or drag to upload'}
                                        </div>)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Upload a clear, square image (max 2MB, .jpg/.png)</p>
                            </div>
                            <section>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                    <div className="border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                        <p className="text-base font-semibold text-gray-800 md:text-sm dark:text-white">Personal Information</p>
                                    </div>

                                    <div className="space-y-6 px-4 py-4">
                                        {/* Row 1: Names + Suffix */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Last Name</Label>
                                                <Input
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value)}
                                                    placeholder="e.g., Dela Cruz"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Given Name</Label>
                                                <Input
                                                    value={data.given_name}
                                                    onChange={(e) => setData('given_name', e.target.value)}
                                                    placeholder="e.g., Juan"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Middle Name</Label>
                                                <Input
                                                    value={data.middle_name}
                                                    onChange={(e) => setData('middle_name', e.target.value)}
                                                    placeholder="e.g., Katakutan"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Suffix</Label>
                                                <Select value={data.suffix} onValueChange={(value) => setData('suffix', value)} disabled={isReadOnly}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select suffix" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Jr.">Jr.</SelectItem>
                                                        <SelectItem value="Sr.">Sr.</SelectItem>
                                                        <SelectItem value="III">III</SelectItem>
                                                        <SelectItem value="IV">IV</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Row 2: Nickname, Contact, Email */}
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Nickname</Label>
                                                <Input
                                                    value={data.nickname}
                                                    onChange={(e) => setData('nickname', e.target.value)}
                                                    placeholder="e.g., Johnny"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Contact Number</Label>
                                                <Input
                                                    value={data.contact_number}
                                                    onChange={(e) => setData('contact_number', e.target.value)}
                                                    placeholder="e.g., 912 3456 789"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Email Address</Label>
                                                <Input
                                                    type="email"
                                                    value={data.email}
                                                    onBlur={checkEmail}
                                                    onChange={(e) => {
                                                        setData('email', e.target.value);
                                                        setEmailStatus(null);
                                                        setEmailError(null);
                                                    }}
                                                    placeholder="e.g., example@mail.com"
                                                    disabled={isReadOnly}
                                                />
                                                <div className="mt-2 flex justify-end">
                                                    {emailStatus === 'checking' && (
                                                        <p className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-500">Checking...</p>
                                                    )}
                                                    {emailStatus === 'available' && (
                                                        <p className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                                                            Email is available
                                                        </p>
                                                    )}
                                                    {emailStatus === 'taken' && (
                                                        <p className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-600">{emailError}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                            {/* Region */}
                                            <div>
                                                <Label htmlFor="region" className="mb-1 text-gray-400 dark:text-white">
                                                    Region
                                                </Label>
                                                <Select value={data.region} onValueChange={(value) => setData('region', value)} disabled={isReadOnly}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Region" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {regionOptions.map((region) => (
                                                            <SelectItem key={region} value={region}>
                                                                {region}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Province */}
                                            <div>
                                                <Label htmlFor="province" className="mb-1 text-gray-400 dark:text-white">
                                                    Province
                                                </Label>
                                                <Select
                                                    value={data.province}
                                                    onValueChange={(value) => setData('province', value)}
                                                    disabled={!data.region || isReadOnly}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Province" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {provinceOptions.map((province) => (
                                                            <SelectItem key={province} value={province}>
                                                                {province}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* City/Municipality */}
                                            <div>
                                                <Label htmlFor="city" className="mb-1 text-gray-400 dark:text-white">
                                                    City/Municipality
                                                </Label>
                                                <Select value={data.city} onValueChange={(value) => setData('city', value)} disabled={!data.province || isReadOnly}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select City/Municipality" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {municipalityOptions.map((city) => (
                                                            <SelectItem key={city} value={city}>
                                                                {city}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Barangay */}
                                            <div>
                                                <Label htmlFor="barangay" className="mb-1 text-gray-400 dark:text-white">
                                                    Barangay
                                                </Label>
                                                <Select
                                                    value={data.barangay}
                                                    onValueChange={(value) => setData('barangay', value)}
                                                    disabled={!data.city || isReadOnly}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Barangay" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {barangayOptions.map((barangay) => (
                                                            <SelectItem key={barangay} value={barangay}>
                                                                {barangay}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        {/* Row 3: House Address */}
                                        <div>
                                            <Label className="text-gray-400 dark:text-white" htmlFor="house_address">
                                                House Address
                                            </Label>
                                            <Input
                                                id="house_address"
                                                value={data.house_address}
                                                onChange={(e) => setData('house_address', e.target.value)}
                                                placeholder="e.g., 123 Main St."
                                                className="w-full"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                    <div className="border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                        <p className="text-base font-semibold text-gray-800 md:text-sm dark:text-white">Demographics</p>
                                    </div>

                                    <div className="space-y-6 px-4 py-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Sex</Label>
                                                <RadioGroup
                                                    defaultValue={data.sex}
                                                    onValueChange={(val) => setData('sex', val)}
                                                    className="mt-1 flex gap-4"
                                                    disabled={isReadOnly}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value="Male" /> <Label>Male</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <RadioGroupItem value="Female" /> <Label>Female</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                            <div>
                                                {/* Birth date */}
                                                <div className="w-full">
                                                    <Label htmlFor="birthdate" className="text-gray-400 dark:text-white">
                                                        Date of Birth
                                                    </Label>
                                                    <Input
                                                        id="birthdate"
                                                        type="date"
                                                        value={data.birthdate ? data.birthdate.split('T')[0] : ''}
                                                        onChange={(e) => setData('birthdate', e.target.value)}
                                                        max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                                        min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]} // 100 years ago
                                                        disabled={isReadOnly}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Birthplace</Label>
                                                <Input value={data.birthplace} onChange={(e) => setData('birthplace', e.target.value)}
                                                    disabled={isReadOnly}
                                                />
                                            </div>

                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Civil Status</Label>
                                                <Select value={data.civil_status} onValueChange={(val) => setData('civil_status', val)} disabled={isReadOnly}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select civil status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Single">Single</SelectItem>
                                                        <SelectItem value="Married">Married</SelectItem>
                                                        <SelectItem value="Widow/Widower">Widow/Widower</SelectItem>
                                                        <SelectItem value="Separated">Separated</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Name of Spouse</Label>
                                                <Input value={data.spouse_name} onChange={(e) => setData('spouse_name', e.target.value)} disabled={isReadOnly} />
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Religion</Label>
                                                <Select value={data.religion} onValueChange={(value) => setData('religion', value)} disabled={isReadOnly}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select Religion" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            'Roman Catholic',
                                                            'Christian',
                                                            'Islam',
                                                            'Buddhist',
                                                            'Hindu',
                                                            'Iglesia ni Cristo',
                                                            'Seventh-day Adventist',
                                                            'Jehovah’s Witnesses',
                                                            'Others',
                                                        ].map((religion) => (
                                                            <SelectItem key={religion} value={religion}>
                                                                {religion}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                    <div className="border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                        <p className="text-base font-semibold text-gray-800 md:text-sm dark:text-white">Education</p>
                                    </div>

                                    <div className="space-y-6 px-4 py-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <Select value={data.education} onValueChange={(val) => setData('education', val)} disabled={isReadOnly}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select attainment" />
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
                                            </div>
                                            <div>
                                                <Input
                                                    placeholder="Degree (if applicable)"
                                                    value={data.college_degree}
                                                    onChange={(e) => setData('college_degree', e.target.value)}
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <Input
                                                    placeholder="Postgraduate Degree (if any)"
                                                    value={data.postgrad_degree}
                                                    onChange={(e) => setData('postgrad_degree', e.target.value)}
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                    <div className="border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                        <p className="text-base font-semibold text-gray-800 md:text-sm dark:text-white">Employment Information</p>
                                    </div>

                                    <div className="space-y-6 px-4 py-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Position</Label>
                                                <Select value={data.position} onValueChange={(value) => setData('position', value)} disabled={isReadOnly}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select position" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {positions.map((pos) => (
                                                            <SelectItem key={pos.id} value={pos.title}>
                                                                {pos.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Salary Grade</Label>
                                                <Select value={data.salary_grade} onValueChange={(value) => setData('salary_grade', value)} disabled={isReadOnly}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select salary grade" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {salaryGrades.map((sg) => (
                                                            <SelectItem key={`SG ${sg}`} value={`SG ${sg}`}>
                                                                {`SG ${sg}`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-gray-400 dark:text-white">Office/Department</Label>
                                                <Select value={data.office} onValueChange={(value) => setData('office', value)} disabled={isReadOnly}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select office/department" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.name}>
                                                                {dept.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                    <div className="border-b border-gray-200 bg-gray-100 px-4 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                        <p className="text-base font-semibold text-gray-800 md:text-sm dark:text-white">Membership Information</p>
                                    </div>

                                    <div className="space-y-6 px-4 py-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                { key: 'physically_challenged', label: 'Are you a Physically-Challenged Person?' },
                                                { key: 'solo_parent', label: 'Are you a Solo Parent?' },
                                                { key: 'adoptive_couple', label: 'Are you part of an Adoptive Couple?' },
                                            ].map((item) => (
                                                <div key={item.key}>
                                                    <Label>{item.label}</Label>
                                                    <RadioGroup
                                                        value={data[item.key as keyof ProfileForm] ? 'Yes' : 'No'} // Convert boolean to string ("Yes" or "No")
                                                        onValueChange={(val) => setData(item.key as keyof ProfileForm, val === 'Yes')} // Convert string back to boolean
                                                        className="mt-1 flex gap-4"
                                                        disabled={isReadOnly}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <RadioGroupItem value="Yes" />
                                                            <Label>Yes</Label>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <RadioGroupItem value="No" />
                                                            <Label>No</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div>
                                    <p className="text-muted-foreground -mt-4 text-sm">
                                        Your email address is unverified.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Click here to resend the verification email.
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has been sent to your email address.
                                        </div>
                                    )}
                                </div>
                            )}
                            {['Conditional Pre-approved', 'Conditional Approved'].includes(data.status ?? '') ? (
                                // PDF Document Upload Section
                                <section className="grid gap-4">
                                    <h2 className="text-xl font-semibold">Update PDF Document</h2>
                                    <div className="grid gap-2">
                                        <Label>Instructions for uploading your PDF document:</Label>
                                        <p className="text-muted-foreground text-sm">
                                            - Upload PDF file only. <br />
                                            - Maximum file size: 5MB <br />
                                            - Ensure the Employee ID is clearly scanned <br />
                                            - Only PDF format is accepted (no Word, Excel, or images)
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="mt-2 text-blue-600 underline hover:text-blue-800"
                                                    >
                                                        View Sample Employee ID
                                                    </button>
                                                </DialogTrigger>

                                                <DialogContent className="max-w-lg">
                                                    <DialogHeader>
                                                        <DialogTitle>Sample Employee ID</DialogTitle>
                                                    </DialogHeader>

                                                    <div className="mt-4">
                                                        <img
                                                            src={`${window.APP_BASE_URL}assets/images/sample.png`}
                                                            alt="Sample Employee ID"
                                                            className="w-full rounded-lg border"
                                                        />
                                                        <p className="mt-3 text-sm text-muted-foreground">
                                                            Make sure your uploaded document is clear, readable, and not cropped.
                                                        </p>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </p>
                                        <div
                                            {...getPdfRootProps()}
                                            className={`w-full rounded-lg border-2 border-dashed p-6 text-center text-sm transition ${isPdfDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                                }`}
                                        >
                                            <input {...getPdfInputProps()} />
                                            {isPdfDragActive ? (
                                                <p className="text-blue-500">Drop your PDF here…</p>
                                            ) : (
                                                <>
                                                    {data.documents ? (
                                                        data.documents instanceof File ? (
                                                            <p className="text-green-600">{data.documents.name}</p>
                                                        ) : (
                                                            <p className="text-blue-600">PDF already uploaded</p>
                                                        )
                                                    ) : (
                                                        <p className="text-gray-500">Drag & drop or click to select</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            ) : (
                                // View Uploaded PDF Section
                                <section>
                                    <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-neutral-900">
                                        <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-100 px-6 py-3 dark:border-gray-700 dark:bg-neutral-800">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Uploaded Documents</h4>
                                            </span>
                                        </div>
                                        {/* Instructions */}
                                        <div className="px-6 py-2 bg-gray-50 dark:bg-neutral-850 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                                            <p>
                                                You can view your previously uploaded Employee ID here. <br />
                                                Please ensure:
                                            </p>
                                            <ul className="ml-4 list-disc mt-1">
                                                <li>Upload PDF file only.</li>
                                                <li>Maximum file size is 5MB.</li>
                                                <li>Documents are clear and legible.</li>
                                                <li>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="mt-2 text-blue-600 underline hover:text-blue-800"
                                                            >
                                                                View Sample Employee ID
                                                            </button>
                                                        </DialogTrigger>

                                                        <DialogContent className="max-w-lg">
                                                            <DialogHeader>
                                                                <DialogTitle>Sample Employee ID</DialogTitle>
                                                            </DialogHeader>

                                                            <div className="mt-4">
                                                                <img
                                                                    src={`${window.APP_BASE_URL}assets/images/sample.png`}
                                                                    alt="Sample Employee ID"
                                                                    className="w-full rounded-lg border"
                                                                />
                                                                <p className="mt-3 text-sm text-muted-foreground">
                                                                    Make sure your uploaded document is clear, readable, and not cropped.
                                                                </p>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="grid grid-cols-2 border-t border-gray-200 px-6 py-3 dark:border-gray-700">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {typeof data.documents === 'string' ? (
                                                    <a
                                                        href={`/storage/${data.documents}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        View Uploaded Supporting Documents
                                                    </a>
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        No document uploaded.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}

                            <div className="flex items-center justify-end gap-4">
                                <Button className="bg-green-600 text-white hover:bg-green-800" disabled={processing}>
                                    Save Changes
                                </Button>
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-neutral-600">Saved Changes</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                    {auth.user.status === 'Approved' && (
                        <ResignUser />
                    )}

                    {auth.user.status === 'Resigned' && (
                        <ReactivateUser />
                    )}
                </SettingsLayout>
            </AppLayout>
        </>
    );
}
