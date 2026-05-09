<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Elections;
use App\Models\Candidate;
use App\Models\User;
use App\Models\Vote;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ElectionReportController extends Controller
{
    public function index(Request $request)
    {
        $electionId = $request->input('election_id');
        $elections = Elections::select('id', 'title')->orderBy('created_at', 'desc')->get();
        $selectedElection = $electionId ? Elections::find($electionId) : null;

        $summary = null;

        if ($electionId) {
            $election = Elections::find($electionId);

            if ($election) {

                $totalVoters = User::where('membership_status', 'Active')
                    ->where('affiliation', 'Member')
                    ->count();

                $totalVotes = Vote::distinct('user_id')
                    ->where('election_id', $electionId)
                    ->count('user_id');

                $turnoutRate = round($totalVotes / $totalVoters * 100, 2);

                $totalCandidates = Candidate::where('election_id', $electionId)->count();

                // Get candidates with votes
                $candidates = Candidate::with(['position', 'user'])
                    ->where('election_id', $electionId)
                    ->where('status', 'Approved')
                    ->get()
                    ->map(function ($cand) use ($electionId, $totalVoters, $totalVotes) {
                        $votes = Vote::where('election_id', $electionId)
                            ->where('candidate_id', $cand->user_id)
                            ->count();

                        return [
                            'id' => $cand->id,
                            'position_id' => $cand->position->id,
                            'position' => $cand->position->position,
                            'slots' => $cand->position->slots, // number of slots per position
                            'candidate' => trim("{$cand->user->last_name}, {$cand->user->given_name} {$cand->user->middle_name} {$cand->user->suffix}"),
                            'emp_position' => $cand->user->position,
                            'emp_office' => $cand->user->office,
                            'votes' => $votes,
                            'image' => $cand->user->image,
                            'percentage' => $totalVoters > 0 ? round($votes / $totalVoters * 100, 2) : 0,
                            'percentage_of_voters' => $totalVoters > 0 ? round($votes / $totalVoters * 100, 2) : 0,
                        ];
                    });

                // Group candidates by position
                $grouped = $candidates->groupBy('position_id');

                // Determine Win/Lose per position
                $candidatesWithResult = $grouped->map(function ($group) {
                    $slots = $group->first()['slots']; // slots for this position
                    $sorted = $group->sortByDesc('votes')->values();

                    return $sorted->map(function ($cand, $index) use ($slots) {
                        $cand['result'] = $index < $slots ? 'Win' : 'Lose';
                        return $cand;
                    });
                })->flatten(1); // flatten back to single collection

                // Sort by votes globally if needed
                $polls = $candidatesWithResult->sortByDesc('votes')->values();

                // Get authenticated user for “Prepared by”
                $authUser = Auth::user();
                $preparedBy = $authUser
                    ? trim("{$authUser->given_name} {$authUser->middle_name} {$authUser->last_name} {$authUser->suffix}")
                    : 'System Administrator';

                $summary = [
                    'election' => $election,
                    'total_voters' => $totalVoters,
                    'total_votes' => $totalVotes,
                    'turnout_rate' => $turnoutRate,
                    'total_candidates' => $totalCandidates,
                    'selected_election' => $selectedElection,
                    'candidates' => $polls,
                    'preparedBy' => $preparedBy,
                    'role' => $authUser->role ?? 'System Administrator',
                ];
            }
        }

        return Inertia::render('report/ElectionSummary', [
            'elections' => $elections,
            'summary' => $summary,
            'selected_election' => $selectedElection,
        ]);
    }

}
