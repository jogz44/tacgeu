<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Models\Announcement;
use Inertia\Inertia;
use Carbon\Carbon;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->type;
        $query = Announcement::with('user')
            ->orderBy('created_at', 'desc');

        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        // Filtering by type
        if ($type) {
            $query->where('type', $request->type);
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        }

        return Inertia::render('announcements/announcement', [
            'announcements' => $query->paginate(5)->withQueryString(),
            'filteredType' => $type,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'type' => 'required|string',
            'status' => 'required|string',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date',
        ]);

        $validated['user_id'] = auth()->id();
        // Handle image upload
        if ($request->hasFile('image')) {
            // Store image in public/announcements and get the relative path
            $path = $request->file('image')->store('announcements', 'public');
            $validated['image'] = $path; // Save the relative path to DB
        }

        Announcement::create($validated);

        return redirect()->back()->with('success', 'Announcement posted.');
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'type' => 'required|string',
            'status' => 'required|string',
            'published_at' => 'nullable|date',
            'scheduled_at' => 'nullable|date',
        ]);

        if ($request->published_at) {
            $validated['published_at'] = Carbon::parse($request->published_at)->format('Y-m-d H:i:s');
        }

        if ($request->scheduled_at) {
            $validated['scheduled_at'] = Carbon::parse($request->scheduled_at)->format('Y-m-d H:i:s');
        }

        $validated['user_id'] = auth()->id();
        // Handle image upload
        if ($request->hasFile('image')) {
            // Store image in public/announcements and get the relative path
            $path = $request->file('image')->store('announcements', 'public');
            $validated['image'] = $path; // Save the relative path to DB

            // Optional: delete old image from storage if exists
            if ($announcement->image) {
                \Storage::disk('public')->delete($announcement->image);
            }
        }

        $announcement->update($validated);

        return redirect()->back()->with('success', 'Announcement updated.');
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();
        return redirect()->back()->with('success', 'Announcement deleted.');
    }

    // public function getUpdateCounts()
    // {
    //     return response()->json([
    //         'Announcements' => Announcement::where('type', 'Announcements')->count(),
    //         'Meetings' => Announcement::where('type', 'Meetings')->count(),
    //         'Events' => Announcement::where('type', 'Events')->count(),
    //         'Programs' => Announcement::where('type', 'Programs')->count(),
    //         'pendingApplicantMC' => User::where('status', 'Pending')->count(),
    //         'pendingApplicantPres' => User::where('status', 'Pre-approved')->count(),
    //         'pendingConditionalPre' => User::where('status', 'Conditional Pre-approved')->count(),
    //         'pendingPres' => User::where('status', 'Conditional Approved')->count(),
    //         'rejected' => User::where('status', 'Rejected')->count(),
    //     ]);
    // }

    public function getUpdateCounts()
    {
        $today = now();

        return response()->json([
            'Announcements' => Announcement::where('type', 'Announcements')
                ->where('scheduled_at', '>', $today)
                ->count(),
            'Meetings' => Announcement::where('type', 'Meetings')
                ->where('scheduled_at', '>', $today)
                ->count(),
            'Events' => Announcement::where('type', 'Events')
                ->where('scheduled_at', '>', $today)
                ->count(),
            'Programs' => Announcement::where('type', 'Programs')
                ->where('scheduled_at', '>', $today)
                ->count(),
            'pendingApplicantMC' => User::where('status', 'Pending')->count(),
            'pendingApplicantPres' => User::where('status', 'Pre-approved')->count(),
            'pendingConditionalPre' => User::where('status', 'Conditional Pre-approved')->count(),
            'pendingPres' => User::where('status', 'Conditional Approved')->count(),
            'rejected' => User::where('status', 'Rejected')->count(),
        ]);
    }
}
