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
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Candidate, Position, type BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, CircleX, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vote',
        href: '/tacgeu/vote',
    },
];

type VoteProps = {
    require_exact_vote_count: boolean;
    hasVoted: boolean;
};

export default function Vote({ require_exact_vote_count, hasVoted }: VoteProps) {
    const candidates = (usePage().props.candidates as Candidate[]) || [];
    const positions = (usePage().props.positions as Position[]) || [];
    const election = (usePage().props.election as any) || [];
    const [isSubmit, setSubmit] = useState(false);
    const [isValid, setValid] = useState(false);
    const { auth } = usePage().props as any;
    const [votes, setVotes] = useState<Record<number, number[]>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [showAlreadyVotedModal, setShowAlreadyVotedModal] = useState(false);
    const { data, setData, post, processing, reset } = useForm({
        election_id: '',
        votes: [] as {
            position_id: number;
            candidate_ids: number[];
        }[],
    });

    // Total slots available
    const totalVotesAllowed = positions.reduce((sum: number, pos: any) => sum + Number(pos.slots), 0);

    useEffect(() => {
        if (hasVoted) {
            setShowAlreadyVotedModal(true);
        }
    }, [hasVoted]);

    useEffect(() => {
        if (hasVoted) {
            setShowAlreadyVotedModal(true);
        }
    }, [hasVoted]);

    // Total votes cast so far
    const totalVotesCast = Object.values(votes).reduce((sum, ids) => sum + ids.length, 0);
    const exactRequired = Number(require_exact_vote_count) === 1;
    // Update isValid based on require_exact_vote_count
    useEffect(() => {
        if (require_exact_vote_count) {
            // ✅ Must be EXACT
            setValid(totalVotesCast === totalVotesAllowed);
        } else {
            // ✅ Can be up to
            setValid(totalVotesCast > 0 && totalVotesCast <= totalVotesAllowed);
        }
    }, [totalVotesCast, totalVotesAllowed, require_exact_vote_count]);

    const toggleVote = (positionId: number, candidateId: number, maxVotes: number) => {
        if (!isElectionActive) return;
        setVotes((prevVotes) => {
            const selected = prevVotes[positionId] || [];
            const isSelected = selected.includes(candidateId);

            if (isSelected) {
                return { ...prevVotes, [positionId]: selected.filter((id) => id !== candidateId) };
            }

            if (selected.length < maxVotes) {
                return { ...prevVotes, [positionId]: [...selected, candidateId] };
            }

            return prevVotes;
        });
    };

    const handleSubmitVotes = () => {
        if (isSubmit) return;
        // ✅ Pre-submit validation
        setSubmit(true);

        // Format vote data
        const formattedVotes = Object.entries(votes).map(([positionId, candidateIds]) => ({
            position_id: Number(positionId),
            candidate_ids: candidateIds, // ✅ Correct key for your form type
        }));
        const formPayload = {
            election_id: String(election.id),
            votes: formattedVotes,
        };

        router.post(route('vote.store'), formPayload, {
            forceFormData: false, // ✅ force JSON
            preserveScroll: true,
            onSuccess: () => {
                setSubmit(false);
                toast.success('Success', {
                    description: 'Your vote has been submitted.',
                    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                    duration: 3500,
                });
            },
            onError: (errors) => {
                setSubmit(false);
                toast.error('Error', {
                    description: Object.values(errors).flat().join('\n'),
                    icon: <CircleX className="h-5 w-5 text-red-600" />,
                    duration: 3500,
                });
                console.error('Vote error:', errors);
            },
        });
    };

    const stripTime = (date: Date | string) => {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    const todayDate = stripTime(new Date());
    const electionStart = stripTime(election.start_date);
    const electionEnd = stripTime(election.end_date);

    const isElectionActive = todayDate >= electionStart && todayDate <= electionEnd;

    let electionStatus = 'Upcoming Election';
    if (todayDate >= electionStart && todayDate <= electionEnd) {
        electionStatus = 'Ongoing Election';
    } else if (todayDate > electionEnd) {
        electionStatus = 'Election Ended';
    }

    const formattedStart = electionStart.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
    const formattedEnd = electionEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });

    // Check if same day
    const sameDay = electionStart.toDateString() === electionEnd.toDateString();

    return (
        <>
            <Toaster position="top-right" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Candidates" />
                <div className="flex h-full w-full flex-col gap-4 p-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border py-4 md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-300/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 space-y-4 px-4">
                            {positions.length > 0 && (
                                <div className="flex items-center justify-between">
                                    {/* Left: Title */}
                                    <Heading title={election.title} description="Casting of Votes" />

                                    {/* Right: Date */}
                                    {/* <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                        <CalendarDays className="w-4 h-4 text-green-600" />
                                        <span>
                                            {new Date(election.start_date).toDateString() ===
                                                new Date(election.end_date).toDateString()
                                                ? new Date(election.start_date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                })
                                                : `${new Date(election.start_date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                })} - ${new Date(election.end_date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                })}`}
                                        </span>
                                    </div> */}
                                </div>
                            )}

                            <div className="space-y-6 px-6">
                                <div className="flex items-center justify-between rounded-xl border border-emerald-300/40 bg-emerald-50 px-4 py-3 shadow-sm dark:border-emerald-700/40 dark:bg-emerald-900/20">
                                    {/* Left side */}
                                    <div className="flex items-center gap-3">
                                        {/* Pulsing icon */}
                                        <CheckCircle className="h-7 w-7 animate-pulse text-emerald-500" />
                                        <span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-lg font-semibold text-transparent dark:from-emerald-400 dark:to-emerald-300">
                                            {electionStatus}
                                        </span>
                                    </div>

                                    {/* Right side (Countdown / End Date) */}
                                    <div className="text-lg text-gray-600 dark:text-gray-300">
                                        {/* Ends on{" "} */}
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                            {new Date(election.end_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 px-6">
                                {positions.map((position) => {
                                    const positionCandidates = candidates.filter((c) => Number(c.position_id) === Number(position.id));
                                    const selected = votes[position.id] || [];

                                    return (
                                        <div key={position.id} className="text-center">
                                            <h2 className="w-full rounded-lg border-y border-gray-300 bg-gray-100 py-2 text-center text-sm font-bold tracking-wide text-gray-700 uppercase dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                                                {position.position} ({selected.length} / {position.slots})
                                            </h2>

                                            {positionCandidates.length === 0 ? (
                                                <p className="mt-8 text-gray-500 dark:text-gray-400">No candidates for this position</p>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4 px-2 pt-10 pb-2 sm:grid-cols-2 md:grid-cols-3">
                                                    {positionCandidates.map((candidate: Candidate) => {
                                                        const isSelected = selected.includes(candidate.id);
                                                        const fullName = [
                                                            candidate.given_name,
                                                            candidate.middle_name,
                                                            candidate.last_name,
                                                            candidate.suffix,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ');

                                                        return (
                                                            <button
                                                                key={candidate.id}
                                                                onClick={() => toggleVote(Number(position.id), candidate.id, Number(position.slots))}
                                                                className={`relative flex w-full transform cursor-pointer flex-col items-center rounded-xl border bg-white p-4 shadow-sm transition duration-300 ease-in-out ${
                                                                    isSelected
                                                                        ? 'border-green-500 ring-4 ring-green-500'
                                                                        : 'hover:scale-105 hover:shadow-lg dark:bg-neutral-900'
                                                                }`}
                                                            >
                                                                {isSelected && (
                                                                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm text-white shadow-md ring-2 ring-white">
                                                                        ✓
                                                                    </span>
                                                                )}
                                                                {candidate.image ? (
                                                                    <img
                                                                        src={`/storage/${candidate.image}`}
                                                                        alt={fullName}
                                                                        className="mb-3 h-24 w-24 rounded-full object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.onerror = null;
                                                                            e.currentTarget.style.display = 'none';
                                                                            const parent = e.currentTarget.parentNode;
                                                                            if (parent) {
                                                                                const brokenText = parent.querySelector(
                                                                                    '.broken-image-text',
                                                                                ) as HTMLElement | null;
                                                                                if (brokenText) brokenText.style.display = 'block';
                                                                            }
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                                                                        No Image
                                                                    </div>
                                                                )}
                                                                <h3 className="text-md mt-4 mb-1 text-center font-semibold text-gray-900 dark:text-white">
                                                                    {candidate.given_name} {candidate.middle_name} {candidate.last_name}
                                                                </h3>

                                                                {candidate.position && (
                                                                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
                                                                        {candidate.position}
                                                                    </p>
                                                                )}

                                                                {candidate.office && (
                                                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                                                        {candidate.office}
                                                                    </p>
                                                                )}

                                                                {candidate.education && (
                                                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                                                        Education: {candidate.education}
                                                                    </p>
                                                                )}

                                                                {candidate.college_degree && (
                                                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                                                        College Degree: {candidate.college_degree}
                                                                    </p>
                                                                )}

                                                                {candidate.postgrad_degree && (
                                                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                                                        Postgrad Degree: {candidate.postgrad_degree}
                                                                    </p>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-center">
                                {positions.length > 0 ? (
                                    isElectionActive ? (
                                        // Normalize both strings for comparison
                                        (auth?.user?.affiliation === 'Member' && election.voters === 'Members') ||
                                        (auth?.user?.affiliation === 'Officer' && election.voters === 'Officers') ? (
                                            <Button
                                                className={`mx-auto w-full max-w-md cursor-pointer rounded-lg p-8 text-xl font-bold text-white transition-colors duration-200 ${hasVoted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                                disabled={isSubmit || !isValid || hasVoted}
                                                onClick={() => setConfirmOpen(true)}
                                            >
                                                {isSubmit ? <LoaderCircle className="animate-spin" /> : <CheckCircle />}
                                                {hasVoted ? 'ALREADY VOTED' : 'SUBMIT VOTE'}
                                            </Button>
                                        ) : (
                                            <p className="text-center text-lg font-medium text-yellow-600">
                                                ⚠️ Participation in this election is limited to{' '}
                                                <span className="font-semibold underline">
                                                    {election.voters === 'Officers' ? 'Officers' : 'Members'}
                                                </span>{' '}
                                                only.
                                            </p>
                                        )
                                    ) : (
                                        <p className="text-center text-lg font-medium text-red-500">
                                            {todayDate < electionStart ? 'Election has not started yet.' : 'Election has ended.'}
                                        </p>
                                    )
                                ) : (
                                    <p className="text-center text-lg font-medium text-gray-500">No open election at the moment.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Vote Submission</AlertDialogTitle>
                            <AlertDialogDescription>
                                Once submitted, your vote cannot be changed. Are you sure you want to continue?
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                            <AlertDialogCancel className="hover:bg-gray-500">No, go back</AlertDialogCancel>

                            <AlertDialogAction
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => {
                                    setConfirmOpen(false);
                                    handleSubmitVotes();
                                }}
                                disabled={isSubmit}
                            >
                                Yes, submit my vote
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                {/* AlertDialog */}
                <AlertDialog open={showAlreadyVotedModal} onOpenChange={setShowAlreadyVotedModal}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-red-600">You have already voted!</AlertDialogTitle>
                            <AlertDialogDescription>
                                Our records show that you have already submitted your vote for this election. You cannot vote again.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button onClick={() => setShowAlreadyVotedModal(false)}>Close</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </AppLayout>
        </>
    );
}
