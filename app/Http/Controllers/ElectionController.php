<?php

namespace App\Http\Controllers;
use App\Models\Elections;
use App\Models\Position;
use App\Models\Candidate;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use App\Models\User;
use App\Models\Notification;

class ElectionController extends Controller
{
    public function index(Request $request)
    {
        $query = Elections::with('user')
            ->join('users', 'elections.user_id', '=', 'users.id')
            ->select('elections.*');
        ;

        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('given_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%");
            });
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            // Default ordering
            $query->latest(); // same as orderBy('created_at', 'desc')
            //$query->orderBy('start_date', 'desc');
        }
        // Paginate
        return Inertia::render('election/elections', [
            'elections' => $query->paginate(5)->withQueryString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'participants' => 'required|string',
            'voters' => 'required|string',
            'filing_start_date' => 'required|date',
            'filing_end_date' => 'required|date',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $openElectionExists = Elections::where('status', 'Open')
            ->exists();

        if ($openElectionExists) {
            return back()->withErrors(['open' => 'An active/open election already exists.']);
        }

        $validated['user_id'] = Auth::id();
        Elections::create($validated);
        //Notify Members
        $users = User::where('affiliation', 'Member')->get();
        foreach ($users as $user) {
            Notification::create([
                'user_id' => $user->id,
                'type' => 'Election',
                'title' => 'New Election Scheduled',
                'body' => 'Dear member, a new election has been announced. The filing of candidacy will start on ' .
                    \Carbon\Carbon::parse($validated['filing_start_date'])->format('F j, Y') .
                    ' and end on ' .
                    \Carbon\Carbon::parse($validated['filing_end_date'])->format('F j, Y') .
                    '. The election will run from ' .
                    \Carbon\Carbon::parse($validated['start_date'])->format('F j, Y') .
                    ' to ' .
                    \Carbon\Carbon::parse($validated['end_date'])->format('F j, Y') . '.',
                'is_read' => false,
            ]);
        }

        return redirect()->route('elections')->with('success', 'Expense created successfully!');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'participants' => 'required|string',
            'voters' => 'required|string',
            'filing_start_date' => 'required|date',
            'filing_end_date' => 'required|date',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
        ]);

        $election = Elections::findOrFail($id);

        $election->update([
            'title' => $validated['title'],
            'participants' => $validated['participants'],
            'voters' => $validated['voters'],
            'filing_start_date' => $validated['filing_start_date'],
            'filing_end_date' => $validated['filing_end_date'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
        ]);
        return redirect()->route('elections')->with('success', 'Elections is updated.');
    }

    public function destroy($id)
    {
        $election = Elections::findOrFail($id);
        $alreadyExist = Position::where('election_id', $id)
            ->exists();

        if ($alreadyExist) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'This election already contains existing position records.']);
        }
        $election->delete();
        return redirect()->back()->with('success', 'Elections deleted.');
    }
    public function vote(Request $request)
    {
        $electionId = $request->input('election_id'); // get election_id from request
        // $elections = Elections::all();
        $elections = Elections::where('status', 'Open')
            ->where('start_date', '>=', now())
            ->where('end_date', '>=', now())
            ->get();

        $candidates = Candidate::join('users', 'candidates.user_id', '=', 'users.id')
            ->join('positions', 'candidates.position_id', '=', 'positions.id')
            ->join('elections', 'positions.election_id', '=', 'elections.id')
            ->select(
                'users.image',
                \DB::raw("CONCAT(users.given_name, ' ', users.middle_name, ' ', users.last_name, ' ', IF(users.suffix IS NOT NULL AND users.suffix != '', users.suffix, '')) AS name"),
                'positions.position',
                'elections.title',
                'candidates.*'
            )
            ->where('elections.id', $electionId)  // filter by election_id
            ->get();

        // Paginate
        return Inertia::render('election/vote', [
            'candidates' => $candidates,
            'elections' => $elections,
        ]);
    }
    public function poll(Request $request)
    {
        // Paginate
        return Inertia::render('election/polls');
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:Open,Closed,Void',
            'remarks' => 'nullable|max:255',
        ]);

        $election = Elections::findOrFail($id);
        $election->status = $validated['status'];
        $election->remarks = $validated['remarks'];
        $election->save();

        $members = User::where('role', 'member')->get();

        foreach ($members as $member) {
            Notification::create([
                'user_id' => $member->id,
                'type' => 'Election',
                'title' => 'Election Status Update',
                'body' => 'The election "' . $election->title . '" status has been : ' . $validated['status'] . '.',
                'is_read' => false,
            ]);
        }

        return redirect()->route('elections')->with('success', 'Election status updated successfully.');
    }
}
