<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Candidate;
use App\Models\Vote;
use App\Models\User;
use App\Models\Elections;

class PollController extends Controller
{
    public function index(Request $request)
    {
        // 1) Count active members
        $totalActiveMembers = User::where('membership_status', 'Active')
            ->where('affiliation', 'Member')
            ->count();

        // 2) Find the currently running election

        $activeElection = Elections::where('status', 'Open')
            ->latest()
            ->first();

        // 3) If no active election, return early
        if (!$activeElection) {
            return Inertia::render('election/polls', [
                'election' => null,
                'polls' => [],
                'turnout' => [
                    'cast' => 0,
                    'total' => $totalActiveMembers,
                    'percentage' => 0,
                ],
            ]);
        }

        // 4) Count distinct voters in this election
        $totalVoters = Vote::distinct('user_id')
            ->where('election_id', $activeElection->id)
            ->count('user_id');

        // 5) Compute turnout percentage
        $turnoutPercentage = round($totalVoters / $totalActiveMembers * 100, 2);

        // 6) Load candidates with accurate vote counts
        $candidates = Candidate::with(['position', 'user'])
            ->where('election_id', $activeElection->id)
            ->where('status', 'Approved')
            ->get()
            ->map(function ($cand) use ($activeElection, $totalActiveMembers, $totalVoters) {
                // Count votes where candidate_id (votes table) matches the user's ID
                $votes = Vote::where('election_id', $activeElection->id)
                    ->where('candidate_id', $cand->user_id)
                    ->count();

                return [
                    'id' => $cand->id,
                    'position' => $cand->position->position,
                    'candidate' => trim("{$cand->user->last_name}, {$cand->user->given_name} {$cand->user->middle_name} {$cand->user->suffix}"),
                    'emp_position' => $cand->user->position,
                    'emp_office' => $cand->user->office,
                    'votes' => $votes,
                    'image' => $cand->user->image,
                    // percentage relative to all active members
                    'percentage' => $totalActiveMembers > 0 ? round($votes / $totalActiveMembers * 100, 2) : 0,
                    // optional: relative to those who actually voted
                    'percentage_of_voters' => $totalVoters > 0 ? round($votes / $totalVoters * 100, 2) : 0,
                ];
            });


        // 7) Group by position purely for ordering in the UI
        $grouped = $candidates->groupBy('position');

        // 8) Flatten back to a single list
        $polls = $grouped->flatten(1)
            ->sortByDesc('votes')
            ->values();
        // 9) Render via Inertia
        return Inertia::render('election/polls', [
            'election' => $activeElection,
            'polls' => $polls,
            'turnout' => [
                'cast' => $totalVoters,
                'total' => $totalActiveMembers,
                'percentage' => $turnoutPercentage,
            ],
        ]);
    }
}
