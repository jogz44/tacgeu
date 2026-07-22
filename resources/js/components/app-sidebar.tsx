import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Separator } from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import type { User } from '@/types';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    BookOpen,
    ChartNoAxesCombined,
    ClipboardList,
    CreditCard,
    FileBarChart,
    FileCog,
    LayoutGrid,
    Newspaper,
    NotebookPen,
    Settings2,
    UserPen,
    UserPlus,
    UserPlus2,
    UserRoundMinus,
    Users,
    WalletCards,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { props } = usePage<{ auth?: { user?: User } }>();
    const user = props.auth?.user;
    const [updateCounts, setUpdateCounts] = useState<Record<string, number>>({});
    const mainNavItems: NavItem[] = [];
    const footerNavItems: NavItem[] = [];
    const [visitedAnnouncements, setVisitedAnnouncements] = useState<string[]>([]);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const response = await axios.get('/announcement/update-counts');
                setUpdateCounts(response.data);
            } catch (error) {
                console.error('Failed to fetch update counts:', error);
            }
        };

        fetchCounts(); // Initial load
        const interval = setInterval(fetchCounts, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval); // Clean up
    }, []);

    // Roles for quick checks
    const nonVisitorMember =
        user?.role !== 'Visitor' && user?.role !== 'Member' && user?.role !== 'Human Resource Officer' && user?.role !== 'Election Committee';
    const isPresident = user?.role === 'President';
    const isMembershipCommittee = user?.role === 'Membership Committee';
    const isElectionCommittee = user?.role === 'Election Committee';
    const isTreasurer = user?.role === 'Treasurer';
    const isHRO = user?.role === 'Human Resource Officer';
    const isPIO = user?.role === 'Public Information Officer';
    const isMember = user?.role === 'Member';

    // Dashboard for roles other than Visitor and Member
    if (nonVisitorMember) {
        mainNavItems.push({
            title: 'Dashboard',
            href: '/tacgeu/dashboard',
            icon: LayoutGrid,
        });
    }

    // Visitor specific
    if (user?.role === 'Visitor') {
        mainNavItems.push({
            title: 'Notice',
            href: '/tacgeu/notice',
            icon: Newspaper,
        });
        if (user?.affiliation === 'Officer' && user?.status === 'Approved') {
            mainNavItems.push({
                title: 'Election',
                icon: ClipboardList,
                isActive: true,
                children: [
                    {
                        title: 'Candidates',
                        href: '/tacgeu/candidates/member',
                    },
                    {
                        title: 'Cast Vote',
                        href: '/tacgeu/vote',
                    },
                    {
                        title: 'Election Poll',
                        href: '/tacgeu/polls',
                    },
                ],
            });
        }
        if (user?.affiliation === 'Member') {
            footerNavItems.push({
                title: 'Membership Application',
                href: user ? `/tacgeu/membershipform/print/${user.id}` : '#',
                icon: BookOpen,
            });
        }
    }

    if (user?.role !== 'Visitor') {
        if (user?.status !== 'Resigned') {
            mainNavItems.push({
                title: 'News and Updates',
                icon: Newspaper,
                isActive: true,
                children: [
                    {
                        title: 'Announcements',
                        href: '/tacgeu/announcement?type=Announcements',
                        badge: updateCounts.Announcements ?? '',
                    },
                    {
                        title: 'Meetings Schedules',
                        href: '/tacgeu/announcement?type=Meetings',
                        badge: updateCounts.Meetings ?? '',
                    },
                    {
                        title: 'Event Schedules',
                        href: '/tacgeu/announcement?type=Events',
                        badge: updateCounts.Events ?? '',
                    },
                    {
                        title: 'Offered Programs',
                        href: '/tacgeu/announcement?type=Programs',
                        badge: updateCounts.Programs ?? '',
                    },
                ],
            });
        }
    }

    // Member specific
    if (user?.role === 'Member') {
        mainNavItems.push(
            {
                title: 'Monthly Contribution',
                href: '/tacgeu/member/contributions',
                icon: NotebookPen,
            },
            ...(user?.status === 'Resigned'
                ? []
                : [
                      {
                          title: 'Election',
                          icon: ClipboardList,
                          isActive: true,
                          children: [
                              {
                                  title: 'Candidates',
                                  href: '/tacgeu/candidates/member',
                              },
                              {
                                  title: 'Cast Vote',
                                  href: '/tacgeu/vote',
                              },
                              {
                                  title: 'Election Poll',
                                  href: '/tacgeu/polls',
                              },
                          ],
                      },
                  ]),
        );
    }
    // President and Membership Committee
    if (isPresident || isMembershipCommittee) {
        mainNavItems.push(
            {
                title: 'Applicants',
                icon: UserPlus,
                isActive: true,
                children: [
                    {
                        title: 'All Applicants',
                        href: '/tacgeu/applicants',
                    },
                    {
                        title: 'Pending Applicants',
                        href: isMembershipCommittee ? '/tacgeu/applicants?status=Pending' : '/tacgeu/applicants?status=Pre-approved',
                        badge: isMembershipCommittee ? updateCounts.pendingApplicantMC : updateCounts.pendingApplicantPres,
                    },
                    {
                        title: isMembershipCommittee ? 'Conditional Pre-approved Applicants' : 'Conditional Approved Applicants',
                        href: isMembershipCommittee ? '/tacgeu/applicants?status=Conditional Pre-approved' : '/tacgeu/applicants?status=Conditional Approved',
                        badge: isMembershipCommittee ? updateCounts.pendingConditionalPre : updateCounts.pendingPres,
                    },
                    {
                        title: 'Rejected Applicant',
                        href: '/tacgeu/applicants?status=Rejected',
                        badge: updateCounts.rejected,
                    },
                ],
            },
            {
                title: 'Union Members',
                icon: ClipboardList,
                isActive: true,
                children: [
                    {
                        title: 'All Members',
                        href: '/tacgeu/members',
                    },
                    {
                        title: 'Active Members',
                        href: '/tacgeu/members?membership_status=Active',
                    },
                    {
                        title: 'Inactive Members',
                        href: '/tacgeu/members?membership_status=Inactive',
                    },
                ],
            },
        );
    }

    if (isMembershipCommittee) {
        mainNavItems.push({
            title: 'Resigned Members',
            icon: UserRoundMinus,
            isActive: true,
            href: '/tacgeu/resigned',
        });
        footerNavItems.push({
            title: 'Utility Settings',
            href: '/tacgeu/app-settings',
            icon: Settings2,
        });
        footerNavItems.push({
            title: 'Form Settings',
            href: '/tacgeu/app-settings/department',
            icon: FileCog,
        });
    }

    if (isElectionCommittee) {
        footerNavItems.push({
            title: 'App Settings',
            href: '/tacgeu/app-settings',
            icon: Settings2,
        });
    }

    // Treasurer and Human Resource Officer
    if (isTreasurer) {
        mainNavItems.push(
            {
                title: 'Pending Membership',
                icon: UserPen,
                href: '/tacgeu/applicants',
            },
            {
                title: 'Receipts',
                icon: WalletCards,
                isActive: true,
                children: [
                    {
                        title: 'Monthly Contributions',
                        href: '/tacgeu/monthly/contribution',
                    },
                    {
                        title: 'Collections',
                        href: '/tacgeu/collections',
                    },
                    {
                        title: 'Receipts',
                        href: '/tacgeu/payments',
                    },
                ],
            },
            {
                title: 'Disbursements Records',
                href: '/tacgeu/expenses',
                icon: CreditCard,
                isActive: true,
                children: [
                    {
                        title: 'Disbursements',
                        href: '/tacgeu/expenses',
                    },
                    // {
                    //     title: 'Approved Expenses',
                    //     href: '/tacgeu/expenses?status=Approved',
                    // },
                    // {
                    //     title: 'Pending Expenses',
                    //     href: '/tacgeu/expenses?status=Pending',
                    // },
                    // {
                    //     title: 'Rejected Expenses',
                    //     href: '/tacgeu/expenses?status=Rejected',
                    // },
                    // {
                    //     title: 'Canceled Expenses',
                    //     href: '/tacgeu/expenses?status=Canceled',
                    // },
                ],
            },
            {
                title: 'Reports',
                icon: FileBarChart,
                isActive: true,
                children: [
                    {
                        title: 'Financial Report',
                        href: '/tacgeu/financial-summary',
                    },
                ],
            },
        );
    }

    // Human Resource Officer
    if (isHRO) {
        mainNavItems.push({
            title: 'Union Members',
            href: '/tacgeu/members',
            icon: ClipboardList,
        });
    }

    // Additional Expense Records for President (if not already added)
    if (isPresident) {
        // Check if Expense Records already added to avoid duplicates
        if (!mainNavItems.some((item) => item.href === '/tacgeu/expenses')) {
            mainNavItems.push({
                title: 'Expense Records',
                href: '/tacgeu/expenses',
                icon: CreditCard,
                isActive: true,
                children: [
                    {
                        title: 'All Expenses',
                        href: '/tacgeu/expenses',
                    },
                    // {
                    //     title: 'Approved Expenses',
                    //     href: '/tacgeu/expenses?status=Approved',
                    // },
                    // {
                    //     title: 'Pending Expenses',
                    //     href: '/tacgeu/expenses?status=Pending',
                    // },
                    // {
                    //     title: 'Rejected Expenses',
                    //     href: '/tacgeu/expenses?status=Rejected',
                    // },
                    // {
                    //     title: 'Canceled Expenses',
                    //     href: '/tacgeu/expenses?status=Canceled',
                    // },
                ],
            });
        }
        footerNavItems.push({
            title: 'User Roles',
            href: '/tacgeu/roles',
            icon: BookOpen,
        });
    }

    if (isElectionCommittee) {
        mainNavItems.push({
            title: 'Election',
            href: '/tacgeu/elections',
            icon: ClipboardList,
        });

        mainNavItems.push({
            title: 'Positions',
            href: '/tacgeu/positions',
            icon: UserPlus2,
        });

        mainNavItems.push({
            title: 'Candidates',
            href: '/tacgeu/candidates',
            icon: Users,
        });

        mainNavItems.push(
            {
                title: 'Election Poll',
                href: '/tacgeu/polls',
                icon: ChartNoAxesCombined,
            },
            {
                title: 'Reports',
                icon: FileBarChart,
                isActive: true,
                children: [
                    {
                        title: 'Election Report',
                        href: '/tacgeu/election-summary',
                    },
                ],
            },
        );
        footerNavItems.push({
            title: 'User Roles',
            href: '/tacgeu/roles',
            icon: BookOpen,
        });
    }

    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <Separator />
            <SidebarContent className="mt-6 text-sm">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
