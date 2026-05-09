<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use App\Models\Position;
use App\Models\Elections;
use Inertia\Inertia;
use App\Models\Notification;

class PositionController extends Controller
{
    public function index(Request $request)
    {
        // Get elections ordered by latest
        $elections = Elections::where('status', '=', 'Open')
            ->latest()
            ->get();

        // Pick the election_id:
        $selectedElectionId = $request->election_id ?? ($elections->first()?->id);

        $query = Position::with('election')
            ->where('election_id', $selectedElectionId);

        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('position', 'like', "%{$search}%");
            });
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('slots', 'desc');
        }

        return Inertia::render('election/positions', [
            'positions' => $query->paginate(5)->withQueryString(),
            'elections' => $elections,
        ]);
    }


    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'election_id' => 'required|integer|exists:elections,id',
                'position' => 'required|string|max:255',
                'slots' => 'required|integer|min:1',
            ]);

            \Log::error('Position creation : ' . $validated['election_id']);

            Position::create($validated);
            //Notify Member
            $today = now();
            Notification::create([
                'user_id' => $validated['user_id'],
                'type' => 'Election',
                'title' => 'New Position',
                'body' => 'A new position has been added to the upcoming election. Please review the updated list of available positions.',
                'is_read' => false,
            ]);
            return redirect()->route('positions')->with('success', 'Position created successfully!');
        } catch (\Exception $e) {
            // Log the error if needed
            \Log::error('Position creation failed: ' . $e->getMessage());

            return redirect()->back()->withInput()->with('error', 'Something went wrong. Please try again.');
        }
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'election_id' => 'required|integer|exists:elections,id',
            'position' => 'required|string|max:255',
            'slots' => 'required|integer|min:1',
        ]);

        $election = Position::findOrFail($id);

        $election->update([
            'election_id' => $validated['election_id'],
            'position' => $validated['position'],
            'slots' => $validated['slots'],
        ]);
        return redirect()->route('positions')->with('success', 'Elections is updated.');
    }

    public function destroy($id)
    {
        $election = Position::findOrFail($id);
        $alreadyExist = Candidate::where('position_id', $id)
            ->exists();

        if ($alreadyExist) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'This position already contains existing candidate records.']);
        }
        $election->delete();
        return redirect()->back()->with('success', 'Position deleted.');
    }
}
