<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use App\Mail\PendingWithdrawMail;
use App\Mail\RejectWithdrawMail;
use Illuminate\Support\Facades\Log;

class ResignedController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $role = auth()->user()->role;

        $offices = User::select('office')
            ->distinct()
            ->whereNotNull('office')
            ->where('office', '!=', '')
            ->orderBy('office', 'asc')
            ->pluck('office');

        $positions = User::select('position')
            ->distinct()
            ->whereNotNull('position')
            ->where('position', '!=', '')
            ->orderBy('position', 'asc')
            ->pluck('position');

        $query = User::query()
            ->where('status', 'Resigned');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('given_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by office
        if ($request->filled('office')) {
            $query->where('office', $request->office);
        }

        // Filter by position
        if ($request->filled('position')) {
            $query->where('position', $request->position);
        }

        // Sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $resignedMembers = $query->paginate(10)->withQueryString();

        return Inertia::render('member/members/resigned', [
            'members' => $resignedMembers,
            'offices' => $offices,
            'positions' => $positions,
            // you can add other filters or user info here as needed
            'filters' => $request->only(['search', 'office', 'position', 'sortBy', 'direction']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store($id)
    {
        // Find the user by ID
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'error' => 'User not found.',
            ], 404);
        }

        // Only allow approving if user status is 'Resigned'
        if ($user->status !== 'Resigned') {
            return response()->json([
                'error' => 'Only users with status Resigned can be approved.',
            ], 403);
        }

        $user->membership_status = 'Inactive'; // or 'Inactive', depending on your logic
        $user->save();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'System',
            'title' => 'Membership Withdrawal ',
            'body' => "Your application has been approved. All your benefits, privileges, and access to facilities are now terminated effective immediately.",
        ]);

        $fullName = $user->given_name . ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;

        try {
            $role = auth()->user()->role;

            if (in_array($role, ['Membership Committee', 'President'])) {
                Mail::to($user->email)->send(new PendingWithdrawMail($fullName, $role, $user->status));
            } else {
                abort(403, 'Unauthorized action.');
            }
        } catch (\Exception $e) {
            Log::error("Failed to send email to Applicant {$fullName}: " . $e->getMessage());
        }


        return redirect()->back()->with('success', 'Membership withdrawal approved successfully.');
    }

    public function reject($id)
    {
        // Find the user by ID
        $user = User::findOrFail($id);

        if (!$user) {
            return response()->json([
                'error' => 'User not found.',
            ], 404);
        }
        $user->status = 'Approved';
        $user->membership_status = 'Active';
        $user->save();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'System',
            'title' => 'Membership Withdrawal ',
            'body' => "Your membership withdrawal request has been rejected. Your current membership benefits, privileges, and facility access will continue as usual.",
        ]);

        $fullName = $user->given_name . ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;

        try {
            $role = auth()->user()->role;

            if (in_array($role, ['Membership Committee', 'President'])) {
                Mail::to($user->email)->send(new RejectWithdrawMail($fullName, $role, $user->status));
            } else {
                abort(403, 'Unauthorized action.');
            }
        } catch (\Exception $e) {
            Log::error("Failed to send email to Applicant {$fullName}: " . $e->getMessage());
        }


        return redirect()->back()->with('success', 'Membership withdrawal rejected.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
