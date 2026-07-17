import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProfileLayout from '@/layouts/profile-layout';
import { Inertia } from '@inertiajs/inertia';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

type ProfileForm = {
    last_name: string;
    given_name: string;
    middle_name: string;
    nickname: string;
    suffix: string;
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
    affiliation: string;

    physically_challenged: boolean;
    solo_parent: boolean;
    adoptive_couple: boolean;
    agreement: boolean;
    documents: File | null;
};

const fieldLabels: Record<keyof ProfileForm, string> = {
    last_name: 'Last Name',
    given_name: 'Given Name',
    middle_name: 'Middle Name',
    suffix: 'Suffix',
    nickname: 'Nickname',
    contact_number: 'Contact Number',
    email: 'Email Address',
    house_address: 'House Address',
    region: 'Region',
    province: 'Province',
    city: 'City/Municipality',
    barangay: 'Barangay',
    birthdate: 'Birth Date',
    birthplace: 'Birthplace',
    sex: 'Sex',
    civil_status: 'Civil Status',
    spouse_name: 'Spouse Name',
    religion: 'Religion',
    education: 'Educational Attainment',
    college_degree: 'College Degree',
    postgrad_degree: 'Postgraduate Degree',
    position: 'Position',
    salary_grade: 'Salary Grade',
    office: 'Office/Department',
    affiliation: 'Affiliation',
    physically_challenged: 'Physically Challenged',
    solo_parent: 'Solo Parent',
    adoptive_couple: 'Adoptive Couple',
    agreement: 'Agreement',
    documents: 'Documents',
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

export default function MembershipProfile() {
    const { props } = usePage<{ flash?: { status?: string } }>();
    const success = props.flash?.status;
    const [formError, setFormError] = useState<string | null>(null);
    const [emailStatus, setEmailStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [locationData, setLocationData] = useState<any[]>([]);
    const [cluster, setCluster] = useState<ClusterData>({});
    const [regionOptions, setRegionOptions] = useState<string[]>([]);
    const [provinceOptions, setProvinceOptions] = useState<string[]>([]);
    const [municipalityOptions, setMunicipalityOptions] = useState<string[]>([]);
    const [barangayOptions, setBarangayOptions] = useState<string[]>([]);
    const [isSaving, setSaving] = useState(false);
    const [positions, setPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const { data, setData, post, processing } = useForm<Required<ProfileForm>>({
        last_name: '',
        given_name: '',
        middle_name: '',
        suffix: '',
        nickname: '',
        contact_number: '',
        email: '',
        house_address: '',
        region: '',
        province: '',
        city: '',
        barangay: '',

        birthdate: '',
        birthplace: '',
        sex: '',
        civil_status: '',
        spouse_name: '',
        religion: '',

        education: '',
        college_degree: '',
        postgrad_degree: '',

        position: '',
        salary_grade: '',
        office: '',
        affiliation: 'Member',

        physically_challenged: false,
        solo_parent: false,
        adoptive_couple: false,
        agreement: false,
        documents: null,
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
                    setData('province', '');
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
                    setData('city', '');
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
                    setData('barangay', '');
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
                params: { email: data.email },
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setSaving(true);
        // List of required fields
        const requiredFields: (keyof ProfileForm)[] = [
            'last_name',
            'given_name',
            'contact_number',
            'email',
            'house_address',
            'region',
            'province',
            'city',
            'barangay',
            'birthdate',
            'birthplace',
            'sex',
            'civil_status',
            'education',
            'position',
            'salary_grade',
            'office',
            'documents',
        ];

        // Find any missing fields
        const missingFields = requiredFields.filter((field) => {
            const value = data[field];
            return value === null || value === undefined || value === '';
        });

        if (missingFields.length > 0) {
            const message = `Please fill in the following fields: ${missingFields.map((f) => fieldLabels[f]).join(', ')}`;
            setFormError(message);
            setSaving(false);
            return;
        }

        if (!data.agreement) {
            setFormError('You must agree to the terms and conditions before submitting.');
            setSaving(false);
            return;
        }
        setFormError(null);

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        Inertia.post(route('membership.store'), formData, {
            onSuccess: (response) => {
                toast.success('Membership application submitted successfully!');
                console.log(response.props.status);
                setSaving(false);
            },
            onError: (error) => {
                setSaving(false);
                toast.success('Error : ', error);
                console.error('Error occurred:', error);
            },
        });
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0];
        if (pdfFile && pdfFile.type === 'application/pdf') {
            const uniqueName = `${Date.now()}_${pdfFile.name}`;
            const renamedFile = new File([pdfFile], uniqueName, { type: pdfFile.type });
            setData('documents', renamedFile);
        } else {
            alert('Only PDF files are allowed.');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': [] },
        maxFiles: 1,
    });

    return (
        <>
            {status && (
                <Alert variant="default" className="mb-4">
                    <AlertTitle>Message</AlertTitle>
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}
            <ProfileLayout title="Individual Membership Profile" description="Fill out your personal details below">
                <Head title="Membership Profile" />
                <form onSubmit={submit} className="space-y-8">
                    {/* Personal Information */}
                    <section className="grid gap-4">
                        <h2 className="text-xl font-semibold">Personal Information</h2>
                        <p className="text-sm text-gray-500 -mt-4">
                            Fields marked with <span className="font-bold text-red-600">*</span> are mandatory.
                        </p>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <Label>Last Name <span className="font-bold text-red-600">*</span></Label>
                                <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} placeholder="e.g., Dela Cruz" />
                            </div>
                            <div>
                                <Label>Given Name <span className="font-bold text-red-600">*</span></Label>
                                <Input value={data.given_name} onChange={(e) => setData('given_name', e.target.value)} placeholder="e.g., Juan" />
                            </div>
                            <div>
                                <Label>Middle Name</Label>
                                <Input
                                    value={data.middle_name}
                                    onChange={(e) => setData('middle_name', e.target.value)}
                                    placeholder="e.g., Katakutan"
                                />
                            </div>
                            <div>
                                <Label>Suffix</Label>
                                <Select value={data.suffix} onValueChange={(value) => setData('suffix', value)}>
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
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
                            <div>
                                <Label>Nickname</Label>
                                <Input value={data.nickname} onChange={(e) => setData('nickname', e.target.value)} placeholder="e.g., Johnny" />
                            </div>
                            <div>
                                <Label>Contact Number <span className="font-bold text-red-600">*</span></Label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">
                                        +63
                                    </span>
                                    <Input
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        placeholder="e.g 912 3456 789"
                                        className="flex-1 rounded-l-none pl-12"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Email Address <span className="font-bold text-red-600">*</span></Label>
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
                                />
                                <div className="mt-2 flex justify-end">
                                    {emailStatus === 'checking' && (
                                        <p className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-500">Checking...</p>
                                    )}
                                    {emailStatus === 'available' && (
                                        <p className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">Email is available</p>
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
                                <Label htmlFor="region" className="mb-1">
                                    Region <span className="font-bold text-red-600">*</span>
                                </Label>
                                <Select value={data.region} onValueChange={(value) => setData('region', value)}>
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
                                <Label htmlFor="province" className="mb-1">
                                    Province <span className="font-bold text-red-600">*</span>
                                </Label>
                                <Select value={data.province} onValueChange={(value) => setData('province', value)} disabled={!data.region}>
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
                                <Label htmlFor="city" className="mb-1">
                                    City/Municipality <span className="font-bold text-red-600">*</span>
                                </Label>
                                <Select value={data.city} onValueChange={(value) => setData('city', value)} disabled={!data.province}>
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
                                <Label htmlFor="barangay" className="mb-1">
                                    Barangay <span className="font-bold text-red-600">*</span>
                                </Label>
                                <Select value={data.barangay} onValueChange={(value) => setData('barangay', value)} disabled={!data.city}>
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
                        <div className="grid grid-cols-1 gap-4">
                            {/* House Address */}
                            <div>
                                <Label htmlFor="house_address" className="mb-1">
                                    House Address <span className="font-bold text-red-600">*</span>
                                </Label>
                                <Input
                                    id="house_address"
                                    value={data.house_address}
                                    onChange={(e) => setData('house_address', e.target.value)}
                                    placeholder="e.g., 123 Main St."
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Demographics */}
                    <h2 className="text-xl font-semibold">Demographics</h2>
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Sex <span className="font-bold text-red-600">*</span></Label>
                            <RadioGroup defaultValue={data.sex} onValueChange={(val) => setData('sex', val)} className="mt-1 flex gap-4">
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
                                <Label htmlFor="birthdate">Date of Birth <span className="font-bold text-red-600">*</span></Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={data.birthdate ? data.birthdate.split('T')[0] : ''}
                                    onChange={(e) => setData('birthdate', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                                    min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]} // 100 years ago
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Birthplace <span className="font-bold text-red-600">*</span></Label>
                            <Input value={data.birthplace} onChange={(e) => setData('birthplace', e.target.value)} />
                        </div>

                        <div>
                            <Label>Civil Status <span className="font-bold text-red-600">*</span></Label>
                            <Select value={data.civil_status} onValueChange={(val) => setData('civil_status', val)}>
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

                        {data.civil_status === 'Married' && (
                            <div>
                                <Label>Name of Spouse</Label>
                                <Input value={data.spouse_name} onChange={(e) => setData('spouse_name', e.target.value)} />
                            </div>
                        )}
                        <div>
                            <Label>Religion</Label>
                            <Select value={data.religion} onValueChange={(value) => setData('religion', value)}>
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
                    </section>

                    {/* Education */}
                    <h2 className="text-xl font-semibold">Education</h2>
                    <Label>Highest Educational Attainment <span className="font-bold text-red-600">*</span></Label>
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Select value={data.education} onValueChange={(val) => setData('education', val)}>
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

                        {/* Show Degree field only for College Undergraduate / College Graduate */}
                        {(data.education === 'College Undergraduate' ||
                            data.education === 'College Graduate' ||
                            data.education === 'Postgraduate') && (
                            <div>
                                <Input
                                    placeholder="Degree (if applicable)"
                                    value={data.college_degree}
                                    onChange={(e) => setData('college_degree', e.target.value)}
                                />
                            </div>
                        )}
                        {/* Show Postgraduate Degree field only for Postgraduate */}
                        {data.education === 'Postgraduate' && (
                            <div>
                                <Input
                                    placeholder="Postgraduate Degree (if any)"
                                    value={data.postgrad_degree}
                                    onChange={(e) => setData('postgrad_degree', e.target.value)}
                                />
                            </div>
                        )}
                    </section>

                    {/* Employment Information */}
                    <h2 className="text-xl font-semibold">Employment Information</h2>
                    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Label>Position <span className="font-bold text-red-600">*</span></Label>
                            <Select value={data.position} onValueChange={(value) => setData('position', value)}>
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
                            <Label>Salary Grade <span className="font-bold text-red-600">*</span></Label>
                            <Select value={data.salary_grade} onValueChange={(value) => setData('salary_grade', value)}>
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
                        </div>
                        <div>
                            <Label>Office/Department <span className="font-bold text-red-600">*</span></Label>
                            <Select value={data.office} onValueChange={(value) => setData('office', value)}>
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
                    </section>

                    {/* Membership Information */}
                    <section className="grid gap-4">
                        <h2 className="text-xl font-semibold">Membership Information</h2>
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
                    </section>
                    {/* PDF Document Upload */}
                    <section className="grid gap-4">
                        <h2 className="text-xl font-semibold">Upload PDF Document <span className="font-bold text-red-600">*</span></h2>
                        <div className="dark:bg-neutral-850 border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            <Label>Instructions for uploading your PDF document:</Label>
                            <ul className="mt-1 ml-4 list-disc">
                                <li>Upload PDF file only.</li>
                                <li>Maximum file size is 5MB.</li>
                                <li>
                                    Ensure the Employee ID is clearly scanned <br />
                                </li>
                                <li>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <span className="cursor-pointer text-blue-600 underline hover:text-blue-800">
                                                View Sample Employee ID
                                            </span>
                                        </DialogTrigger>

                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Sample Employee ID</DialogTitle>
                                            </DialogHeader>

                                            <img src={`${window.APP_BASE_URL}assets/images/sample.png`} alt="Sample Employee ID" className="mt-4 w-full rounded-lg" />
                                        </DialogContent>
                                    </Dialog>
                                </li>
                            </ul>
                        </div>
                        <div className="grid gap-2">
                            <div
                                {...getRootProps()}
                                className={`w-full rounded-lg border-2 border-dashed p-6 text-center text-sm transition ${
                                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                            >
                                <input {...getInputProps()} />
                                {isDragActive ? (
                                    <p className="text-blue-500">Drop your PDF here…</p>
                                ) : data.documents ? (
                                    <p className="text-green-600">Uploaded: {data.documents.name}</p>
                                ) : (
                                    <p className="text-gray-500">Drag & drop or click to select</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Membership Information */}
                    <section className="grid gap-4">
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="agreement"
                                checked={data.agreement}
                                onChange={(e) => setData('agreement', e.target.checked)}
                                className="mt-1"
                                required
                            />
                            <label htmlFor="agreement" className="text-sm">
                                I hereby declare that the information provided is true and correct to the best of my knowledge, and I agree to the{' '}
                                <a href="/terms" className="text-green-700 underline hover:text-green-800">
                                    Terms and Conditions
                                </a>
                                .
                            </label>
                        </div>
                        {formError && <p className="mt-2 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{formError}</p>}
                    </section>

                    <Button type="submit" disabled={isSaving || !data.agreement} className="w-full cursor-pointer">
                        {isSaving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Submit Membership Application
                    </Button>
                </form>
            </ProfileLayout>
        </>
    );
}
