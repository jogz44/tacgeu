import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/date';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Announcement {
    id: number;
    image: string;
    title: string;
    body: string;
    type: string;
    status: string;
    scheduled_at: string;
    published_at: string;
    created_at: string;
}

interface AnnouncementPageProps {
    announcements: Announcement[];
}

export default function Welcome({ announcements }: AnnouncementPageProps) {
    const { auth } = usePage<SharedData>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentTab, setCurrentTab] = useState('0');
    const programAnnouncements = announcements?.filter((a) => a.type === 'Programs' && a.status === 'active') ?? [];
    const announcementsList = announcements?.filter((a) => a.type === 'Announcements' && a.status === 'active') ?? [];
    const eventsAnnouncements = announcements?.filter((a) => a.type === 'Events' && a.status === 'active') ?? [];

    const handlePrev = () => {
        const prev = (Number(currentTab) - 1 + eventsAnnouncements.length) % eventsAnnouncements.length;
        setCurrentTab(prev.toString());
    };

    const handleNext = () => {
        const next = (Number(currentTab) + 1) % eventsAnnouncements.length;
        setCurrentTab(next.toString());
    };

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <header
                className="relative min-h-screen w-full bg-cover bg-center text-white"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.2)), url('${window.APP_BASE_URL}assets/images/main.png')",
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <nav className="relative z-10 flex items-center justify-between px-6 py-4">
                    {/* Logo on the Left */}
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                            <AppLogoIcon className="h-16 w-auto" /> {/* Or use an img tag if you prefer */}
                        </div>
                        <div className="text-lg">
                            <span className="block">Tagum City Government Employees' Union</span>
                            <span className="block text-sm">(TACGEU)</span>
                        </div>
                    </div>

                    {/* Mobile Hamburger Menu */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded p-2 text-white transition hover:bg-white/10 focus:ring-2 focus:ring-white focus:outline-none"
                            aria-label="Toggle mobile menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden items-center gap-4 lg:flex">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-block rounded-md bg-gray-800 px-5 py-2 text-sm font-medium text-white shadow-sm
                 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800
                 dark:bg-gray-200 dark:hover:bg-gray-300 dark:text-gray-900"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                {/* Become a Member button - filled */}
                                <Link
                                    href={route('membership')}
                                    className="inline-block rounded-md bg-[#0D9488] px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0F766E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D9488] dark:bg-[#3E3E3A] dark:hover:bg-[#2C2C28] dark:text-[#EDEDEC]"
                                >
                                    Become A Member
                                </Link>
                                {/* Log in button - outlined */}
                                <Link
                                    href={route('login')}
                                    className="inline-block rounded-md border border-teal-800 px-5 py-2 text-sm font-medium text-teal-800
                   hover:bg-teal-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-800
                   dark:border-gray-200 dark:text-gray-200 dark:hover:bg-gray-200 dark:hover:text-teal-900"
                                >
                                    Log in
                                </Link>


                            </>
                        )}
                    </div>

                </nav>

                <div className="flex h-screen w-full items-center justify-center">
                    <div className="relative z-10 w-full max-w-7xl rounded-xl bg-white/70 p-12 text-center shadow-xl">
                        <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">Welcome to</h1>
                        <h2
                            className="mb-4 text-3xl leading-tight font-extrabold sm:text-5xl md:text-6xl"
                            style={{
                                background: 'linear-gradient(to right, #B89B00, #E57C04, #1B5E20)', // gold → orange → green
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
                            }}
                        >
                            Tagum City Government Employees' Union (TACGEU)
                        </h2>
                        <p className="mb-6 text-lg font-medium text-gray-700 sm:text-xl">Protecting Workers. Empowering Communities.</p>
                        <a
                            href="#join"
                            className="mt-5 inline-block rounded-lg bg-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-md transition duration-300 hover:bg-teal-700 hover:shadow-lg"
                        >
                            Start Your Membership
                        </a>
                    </div>
                </div>

                {/* Mobile Menu (Hidden on large screens, shown on small screens) */}
                {mobileMenuOpen && (
                    <div className="bg-gray-800 px-6 py-4 text-white lg:hidden">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="mb-4 block text-sm">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={route('membership')} className="mb-4 block text-sm">
                                    Become a Member
                                </Link>
                                <Link href={route('login')} className="block text-sm">
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </header>
            <div className="w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                {/* About */}
                <section className="mx-auto max-w-6xl bg-white px-8 py-20">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                        {/* Text Content */}
                        <div>
                            <h2 className="mb-4 text-3xl font-extrabold text-gray-800">About the TACGEU</h2>
                            <p className="mb-6 text-lg leading-relaxed text-gray-700">
                                The Tagum City Government Employees’ Union (TACGEU) is committed to protecting the rights and welfare of public
                                service workers. We champion equitable labor practices, ensure safe and inclusive workspaces, and empower our members
                                through collective representation.
                            </p>
                            <p className="text-lg leading-relaxed text-gray-700">
                                Our mission is to cultivate a strong, unified voice that advocates for transparency, dignity, and fairness in all
                                aspects of government employment. Through strategic partnerships and community initiatives, we strive to build a
                                workplace where every employee is valued and supported.
                            </p>
                        </div>

                        {/* Image */}
                        <div className="h-full w-full">
                            <img
                                src={`${window.APP_BASE_URL}assets/images/logo.png`} // Replace with your actual image
                                alt="Union members in Tagum City"
                                className="h-full w-full rounded-xl object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* Program Offers */}
                {programAnnouncements.length > 0 && (
                    <section className="bg-gray-50 px-6 py-20" id="programs">
                        <div className="mx-auto max-w-5xl text-center">
                            <h2 className="mb-4 text-3xl font-extrabold text-gray-800">Our Programs</h2>
                            <p className="mx-auto mb-16 max-w-3xl text-lg text-gray-600">
                                At TACGEU, we strive to provide programs that empower our members through continuous learning and ensure their health
                                and wellness are prioritized. Explore our key initiatives designed to support you every step of the way.
                            </p>
                        </div>

                        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2">
                            {programAnnouncements.map((program) => (
                                <div key={program.id} className="overflow-hidden rounded-lg bg-white shadow-lg">
                                    <img src={`/storage/${program.image}`} alt={program.title} className="h-48 w-full object-cover" />
                                    <ProgramCard program={program} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Announcements */}
                {announcementsList.length > 0 && (
                    <section className="mx-auto max-w-5xl bg-white px-6 py-16" id="announcements">
                        <h2 className="mb-6 text-3xl font-extrabold text-gray-800">Latest Announcements</h2>
                        <ul className="space-y-6">
                            {announcementsList.map((a) => (
                                <Announcement key={a.id} title={a.title} date={formatDate(a.scheduled_at)} text={a.body} />
                            ))}
                        </ul>
                    </section>
                )}

                {eventsAnnouncements.length > 0 && (
                    <section className="bg-gray-50 px-4 py-20" id="events">
                        <div className="mx-auto max-w-5xl">
                            <header className="mb-12 text-center">
                                <h2 className="text-4xl font-semibold text-gray-900">Upcoming Events</h2>
                                <p className="mt-2 text-base text-gray-600">Stay informed about what’s coming next.</p>
                            </header>

                            <Tabs value={currentTab} className="w-full">
                                <div className="mb-8 flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrev}
                                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                        <span className="text-sm">Previous</span>
                                    </Button>

                                    <TabsList className="hidden gap-3 md:flex">
                                        {eventsAnnouncements.map((_, index) => (
                                            <TabsTrigger
                                                key={index}
                                                value={index.toString()}
                                                onClick={() => setCurrentTab(index.toString())}
                                                className="rounded-full border px-4 py-1 text-sm font-medium transition-colors duration-200 data-[state=active]:bg-green-700 data-[state=active]:text-white data-[state=inactive]:text-gray-700"
                                            >
                                                {index + 1}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <Button
                                        variant="ghost"
                                        onClick={handleNext}
                                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                                    >
                                        <span className="text-sm">Next</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="transition-all duration-300">
                                    {eventsAnnouncements.map((event, index) => (
                                        <TabsContent key={event.id} value={index.toString()}>
                                            <EventCard title={event.title} description={event.body} date={event.scheduled_at} image={event.image} />
                                        </TabsContent>
                                    ))}
                                </div>
                            </Tabs>
                        </div>
                    </section>
                )}

                <section id="join" className="relative min-h-[400px] bg-white px-6 py-32 text-center text-gray-900">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/50 dark:stroke-neutral-100/60" />
                    <div className="relative mx-auto max-w-3xl">
                        <h2 className="text-4xl font-extrabold tracking-tight text-teal-700">Ready to Make a Difference?</h2>
                        <p className="mt-6 text-lg leading-relaxed text-gray-700">Become a member and help us build a stronger, fairer workplace.</p>
                        <a
                            href="/membership"
                            className="mt-10 inline-block rounded-lg bg-teal-600 px-8 py-3 text-lg font-semibold text-white shadow-md transition duration-300 hover:bg-teal-700 hover:shadow-lg"
                        >
                            Become a Member
                        </a>
                    </div>
                </section>
            </div>
            {/* Footer */}
            <footer className="bg-gray-50 px-6 py-12 text-gray-700">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-4">
                    {/* Logo & Intro */}
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-4">
                            <AppLogoIcon className="h-20 w-auto" />
                            <p className="max-w-xs text-sm leading-relaxed">Tagum City Government Employees' Union (TACGEU)</p>
                        </div>
                    </div>

                    {/* Programs */}
                    <div>
                        <h4 className="mb-4 font-semibold text-gray-900">Programs</h4>
                        {programAnnouncements.length > 0 ? (
                            <ul className="space-y-3 text-sm">
                                {programAnnouncements.map((program) => (
                                    <li key={program.id}>
                                        <a href="#programs" className="transition-colors duration-200 hover:text-teal-600">
                                            {program.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No active programs available.</p>
                        )}
                    </div>

                    {/* Union Info */}
                    <div>
                        <h4 className="mb-4 font-semibold text-gray-900">Union Info</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#announcements" className="transition-colors duration-200 hover:text-teal-600">
                                    Announcements
                                </a>
                            </li>
                            <li>
                                <a href="#events" className="transition-colors duration-200 hover:text-teal-600">
                                    Events
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-4 font-semibold text-gray-900">Quick Links</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="/" className="transition-colors duration-200 hover:text-teal-600">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="/membership" className="transition-colors duration-200 hover:text-teal-600">
                                    Membership
                                </a>
                            </li>
                            <li>
                                <a href="/login" className="transition-colors duration-200 hover:text-teal-600">
                                    Log In
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} Tagum City Government Employees' Union. All rights reserved.
                </div>
            </footer>
        </>
    );
}

function EventCard({ title, date, description, image }: { title: string; date: string; description: string; image: string }) {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 150;

    const shouldTruncate = description.length > maxLength;
    const previewText = !expanded && shouldTruncate ? description.slice(0, maxLength).trim() + '...' : description;

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
            <div className="relative h-98 w-full overflow-hidden">
                <img
                    src={`/storage/${image}`}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>

            <div className="space-y-3 p-6">
                <h3 className="text-2xl font-semibold text-green-700">{title}</h3>
                <p className="text-sm text-gray-500">
                    <span>{formatDate(date)}</span>
                </p>
                <p className="text-sm leading-relaxed text-gray-700">
                    {previewText}
                    {shouldTruncate && (
                        <button onClick={() => setExpanded(!expanded)} className="ml-2 text-sm text-teal-600 hover:underline">
                            {expanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
}

function ProgramCard({ program }: { program: Announcement }) {
    const [expanded, setExpanded] = useState(false);
    const [height, setHeight] = useState<number | 'auto'>(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (expanded && contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        } else {
            setHeight(0);
        }
    }, [expanded]);

    return (
        <div className="rounded-xl bg-white p-6">
            <h3 className="mb-3 text-2xl font-semibold text-green-800">{program.title}</h3>

            <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: expanded ? height : 80 }}>
                <div ref={contentRef}>
                    <p className="leading-relaxed text-gray-700">{program.body}</p>
                </div>
            </div>

            {program.body.length > 150 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-3 inline-flex items-center text-sm font-medium text-teal-600 hover:underline"
                >
                    {expanded ? (
                        <>
                            Show less <ChevronUp className="ml-1 h-4 w-4" />
                        </>
                    ) : (
                        <>
                            Read more <ChevronDown className="ml-1 h-4 w-4" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

function Announcement({ title, date, text }: { title: string; date: string; text: string }) {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 180;

    const isLong = text.length > maxLength;
    const displayText = !expanded && isLong ? text.slice(0, maxLength) + '...' : text;

    return (
        <li className="group rounded-md border-l-4 border-green-600 bg-white px-4 py-3 shadow-sm transition hover:bg-green-50">
            <div className="flex cursor-pointer items-center justify-between" onClick={() => setExpanded(!expanded)}>
                <p className="text-base font-semibold text-gray-800">{title}</p>
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="ml-2 text-teal-600 transition hover:text-teal-800"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                )}
            </div>

            <p className="mt-2 text-sm text-gray-700 transition-all duration-300 ease-in-out">
                {displayText}
                {isLong && !expanded && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(true);
                        }}
                        className="ml-2 text-sm font-medium text-teal-600 hover:underline"
                    >
                        Read more
                    </button>
                )}
                {isLong && expanded && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(false);
                        }}
                        className="ml-2 text-sm font-medium text-teal-600 hover:underline"
                    >
                        Show less
                    </button>
                )}
            </p>

            <p className="mt-2 text-xs text-gray-500 italic">{date}</p>
        </li>
    );
}
