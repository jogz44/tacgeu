<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use App\Models\Elections;
use App\Models\Candidate;
use App\Models\Position;
use App\Models\Vote;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class VoteController extends Controller
{
    public function index()
    {
        $activeElection = Elections::where('status', 'Open')
            ->latest()
            ->first();

        $require_exact_vote_count = (bool) AppSetting::where('key', 'require_exact_vote_count')->value('value');

        $hasVoted = false;

        if ($activeElection) {
            $candidates = Candidate::join('users', 'candidates.user_id', '=', 'users.id')
                ->join('positions', 'candidates.position_id', '=', 'positions.id')
                ->join('elections', 'positions.election_id', '=', 'elections.id')
                ->select(
                    'candidates.*',
                    'users.id',
                    'users.given_name',
                    'users.middle_name',
                    'users.last_name',
                    'users.suffix',
                    'users.image',
                    'users.office',
                    'users.position',
                    'positions.position as candidacy',
                    'positions.id as position_id',
                    'elections.title'
                )
                ->where('elections.id', $activeElection->id)
                ->where('candidates.status', "Approved")
                ->get();

            $positions = Position::where('election_id', $activeElection->id)
                ->select('id', 'position', 'slots')
                ->latest()
                ->get();

            $hasVoted = Vote::where('user_id', Auth::id())
                ->where('election_id', $activeElection->id)
                ->exists();
        } else {
            $candidates = collect();
            $positions = collect();
        }

        // Paginate
        return Inertia::render('election/vote', [
            'candidates' => $candidates,
            'positions' => $positions,
            'election' => $activeElection,
            'require_exact_vote_count' => $require_exact_vote_count,
            'hasVoted' => $hasVoted,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'election_id' => 'required|exists:elections,id',
            'votes' => 'required|array|min:1',
            'votes.*.position_id' => 'required|exists:positions,id',
            'votes.*.candidate_ids' => 'required|array|min:1',
            'votes.*.candidate_ids.*' => 'required|exists:users,id',
        ]);

        $userId = Auth::id();

        // 🚫 Check if user has already voted in this election
        $alreadyVoted = Vote::where('user_id', $userId)
            ->where('election_id', $validated['election_id'])
            ->exists();

        if ($alreadyVoted) {
            return redirect()->back(303)->withErrors(['error' => 'You have already voted in this election.']);
        }

        // ✅ Save votes
        foreach ($validated['votes'] as $vote) {
            foreach ($vote['candidate_ids'] as $candidateId) {
                Vote::create([
                    'user_id' => $userId,
                    'election_id' => $validated['election_id'],
                    'position_id' => $vote['position_id'],
                    'candidate_id' => $candidateId,
                ]);
            }
        }

        return redirect()->back(303)->with('success', 'Your vote has been submitted.');
    }
}
