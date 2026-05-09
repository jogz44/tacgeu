<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Position;
use App\Models\Elections;
use App\Models\Candidate;
use App\Models\Notification;
use App\Models\AppSetting;
use Inertia\Inertia;
use Carbon\Carbon;

class CandidateController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('status', 'Approved')
            ->where('membership_status', 'Active')
            ->get();

        $positions = Position::with('election')
            ->join('elections', 'positions.election_id', '=', 'elections.id')
            ->select('positions.*')->get();

        $elections = Elections::where('status', '=', 'Open')
            ->latest()
            ->get();
        // $elections = Elections::where('status', 'Open')
        //     ->where('start_date', '>=', now())
        //     ->where('end_date', '>=', now())
        //     ->get();


        // Paginate
        return Inertia::render('election/candidates', [
            'positions' => $positions,
            'elections' => $elections,
            'users' => $users,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'position_id' => 'required|integer|exists:positions,id',
            'election_id' => 'required|integer|exists:elections,id',
        ]);

        // 🔹 Fetch the election
        $election = Elections::find($validated['election_id']);

        // 🔹 Check filing period
        if ($election && ($election->filing_start_date && $election->filing_end_date)) {
            $today = now()->toDateString();
            $start = Carbon::parse($election->filing_start_date)->toDateString();
            $end = Carbon::parse($election->filing_end_date)->toDateString();

            // ✅ Date-only comparison, inclusive
            if (!($today >= $start && $today <= $end)) {
                $startFormatted = Carbon::parse($election->filing_start_date)->format('M d, Y');
                $endFormatted = Carbon::parse($election->filing_end_date)->format('M d, Y');

                $dateText = $startFormatted === $endFormatted
                    ? $startFormatted
                    : "$startFormatted to $endFormatted";

                return redirect()
                    ->back()
                    ->withInput()
                    ->withErrors([
                        'error' => "Filing period for this election is $dateText."
                    ]);
            }
        }

        // 🔹 Fetch required minimum months from app settings
        $minMonths = AppSetting::where('key', 'candidate_min_months')->value('value');

        if ($minMonths) {
            $user = User::find($validated['user_id']);
            $memberSince = Carbon::parse($user->created_at);

            if ($memberSince->diffInMonths(now()) < $minMonths) {
                return redirect()
                    ->back()
                    ->withInput()
                    ->withErrors([
                        'error' => "Member must be at least {$minMonths} month(s) in the organization before applying as a candidate."
                    ]);
            }
        }

        $existingCandidate = Candidate::where('user_id', $validated['user_id'])
            ->where('election_id', $validated['election_id'])
            ->exists();

        if ($existingCandidate) {
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Member is already registered as a candidate in the selected election.']);
        }

        Candidate::create($validated);
        Notification::create([
            'user_id' => $validated['user_id'],
            'type' => 'Election',
            'title' => 'Candidacy',
            'body' => 'Your candidacy application has been submitted successfully and is pending approval.',
            'is_read' => false,
        ]);

        return redirect()->route('candidates')->with('success', 'Candidate save successfully!');
    }

    public function fetch(Request $request)
    {
        $electionId = $request->input('election_id');
        $search = $request->input('search');
        $status = $request->input('status');

        $candidates = Candidate::join('users', 'candidates.user_id', '=', 'users.id')
            ->join('positions', 'candidates.position_id', '=', 'positions.id')
            ->join('elections', 'positions.election_id', '=', 'elections.id')
            ->select(
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
                'elections.title',
                'candidates.status'
            )
            ->when($electionId, function ($query) use ($electionId) {
                $query->where('elections.id', $electionId);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('users.given_name', 'like', "%{$search}%")
                        ->orWhere('users.middle_name', 'like', "%{$search}%")
                        ->orWhere('users.last_name', 'like', "%{$search}%")
                        ->orWhere('users.suffix', 'like', "%{$search}%");
                });
            })
            ->when($status && $status !== 'All', function ($query) use ($status) {
                $query->where('candidates.status', $status);
            })
            ->get();

        return response()->json([
            'candidates' => $candidates,
        ]);
    }

    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,user_id',
            'election_id' => 'required|exists:elections,id',
            'status' => 'required|in:Pending,Approved,Rejected',
        ]);

        $candidate = Candidate::where('user_id', $validated['candidate_id'])
            ->where('election_id', $validated['election_id'])
            ->first();
        $candidate->status = $validated['status'];
        $candidate->save();

        $bodyMessage = match ($validated['status']) {
            'Approved' => 'Your candidacy application has been approved. Congratulations!',
            'Rejected' => 'Your candidacy application has been rejected. Please contact the committee for more details.',
            default => 'Your candidacy application status has been updated.',
        };

        Notification::create([
            'user_id' => $candidate->user_id,
            'type' => 'Election',
            'title' => 'Candidacy',
            'body' => $bodyMessage,
            'is_read' => false,
        ]);

        return redirect()->route('candidates')->with('success', 'Candidate status updated successfully!');
    }


    public function members(Request $request)
    {
        $users = User::where('status', 'Approved')
            ->where('membership_status', 'Active')
            ->where('affiliation', 'Member')
            ->get();

        $positions = Position::with('election')
            ->join('elections', 'positions.election_id', '=', 'elections.id')
            ->select('positions.*')->get();

        $elections = Elections::where('status', '=', 'Open')
            ->latest()
            ->get();


        // Paginate
        return Inertia::render('election/index', [
            'positions' => $positions,
            'elections' => $elections,
            'users' => $users,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function approvedCandidates(Request $request)
    {
        $electionId = $request->input('election_id');

        $candidates = Candidate::join('users', 'candidates.user_id', '=', 'users.id')
            ->join('positions', 'candidates.position_id', '=', 'positions.id')
            ->join('elections', 'positions.election_id', '=', 'elections.id')
            ->select(
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
                'elections.title',
                'candidates.status',
                'users.created_at'
            )
            ->when($electionId, function ($query) use ($electionId) {
                $query->where('elections.id', $electionId);
            })
            ->where('candidates.status', 'Approved')
            ->get();

        return response()->json([
            'candidates' => $candidates,
        ]);
    }

    public function destroy($election, $id)
    {
        // Find the candidate that belongs to this election
        $candidate = Candidate::where('user_id', $id)
            ->where('election_id', $election)
            ->first();

        // If not found, return an error response
        if (!$candidate) {
            return back()->withErrors([
                'candidate' => 'Candidate not found or does not belong to the selected election.',
            ]);
        }

        // Delete the candidate
        $candidate->delete();

        // Return back with success message
        return back()->with('success', 'Candidate deleted successfully.');
    }

}
