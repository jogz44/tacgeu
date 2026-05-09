import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href?: string; // Optional if it only has children
    icon?: LucideIcon | null;
    isActive?: boolean;
    badge?: number;
    children?: NavItem[]; // <-- Add this for sub-items
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export type Elections = {
    id: number;
    position: string;
    slots: integer;
    election_id: integer;
    created_at: string;
    updated_at: string;
};

export type User = {
    id: number;
    image: File;
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
    employment_status: string;
    position: string;
    salary_grade: string;
    office: string;
    affiliation: string;
    physically_challenged: boolean;
    solo_parent: boolean;
    adoptive_couple: boolean;
    status: string;
    agreement: boolean;
    role: string;
    avatar?: string;
    email_verified_at?: string;
    documents?: string;
    created_at: Date;
};

export interface Candidate {
    id: number;
    user_id: number;
    image: string;
    middle_name: string;
    last_name: string;
    given_name: string;
    suffix: string;
    education: string;
    college_degree: string;
    postgrad_degree: string;
    position: string;
    position_id: string;
    office: string;
    candidacy: string;
    title: string;
    status: string;
    created_at: Date;
}

export interface Position {
    id: number;
    election: Election;
    position: string;
    slots: string;
    end_date: string;
    created_at: string;
}

export interface Election {
    id: number;
    user: User;
    title: string;
    participants: string;
    voters: string;
    start_date: string;
    end_date: string;
    filing_start_date: string;
    filing_end_date: string;
    created_at: string;
}
