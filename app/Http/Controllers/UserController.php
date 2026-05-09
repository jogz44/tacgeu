<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use App\Mail\SendRejected;
use App\Mail\SendApproval;
use App\Mail\SendCredentials;
use App\Models\Notification;

class UserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/registration-options');
    }

    public function member(): Response
    {
        return Inertia::render('auth/membership-profile');
    }

    public function officer(): Response
    {
        return Inertia::render('auth/officer-profile');
    }
    public function members(Request $request)
    {
        $status = $request->input('membership_status');
        $offices = User::select('office')
            ->distinct()
            ->whereNotNull('office')
            ->where('office', '!=', '')
            ->orderBy('office', 'asc')
            ->pluck('office');
        if ($status) {
            if ($status === 'Active') {
                $query = User::where('status', 'Approved')
                    ->where('membership_status', 'Active')
                    ->where('affiliation', 'member');
            } else {
                $query = User::where('membership_status', 'Inactive')
                    ->where('affiliation', 'member');
            }
        } else {
            $query = User::where('status', 'Approved')
                ->where('membership_status', ['Active', 'Inactive'])
                ->where('affiliation', 'member');
        }

        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('given_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filtering by sex
        if ($request->filled('sex')) {
            $query->where('sex', $request->sex);
        }

        // Filtering by civil
        if ($request->filled('civil')) {
            $query->where('civil_status', $request->civil);
        }

        // Filtering by Office
        if ($request->filled('office')) {
            $query->where('office', $request->office);
        }

        // Filtering by educational attainment
        if ($request->filled('education')) {
            $query->where('education', $request->education);
        }

        // Filtering by salary grade
        if ($request->filled('salary')) {
            $query->where('salary_grade', $request->salary);
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc'); // ✅ default sort
        }

        // Paginate
        return Inertia::render('member/members/members', [
            'users' => $query->clone()->paginate(5)->withQueryString(),
            'userList' => $query->clone()->get(),
            'membership_status' => $status,
            'offices' => $offices,
        ]);
    }

    public function allMembers()
    {
        return response()->json(
            User::where('membership_status', 'Active')
                ->where('affiliation', 'Member')
                ->get()
        );
    }

    public function membersData($id)
    {
        $user = User::find($id);
        return inertia::render('member/members/member-details', [
            'user' => $user
        ]);
    }

    public function membersUpdate($id)
    {
        $user = User::find($id);
        return inertia::render('member/members/update-member', [
            'user' => $user
        ]);
    }

    public function roles(Request $request)
    {
        $query = User::where('affiliation', 'Officer');

        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('given_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filtering by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filtering by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        }
        // Paginate
        return Inertia::render('member/roles/roles', [
            'users' => $query->paginate(5)->withQueryString(),
        ]);
    }

    public function applicants(Request $request)
    {
        $status = $request->input('status');
        $membership_status = $request->input('membership_status');
        $role = auth()->user()->role;

        $offices = User::select('office')
            ->distinct()
            ->whereNotNull('office')
            ->where('office', '!=', '')
            ->orderBy('office', 'asc')
            ->pluck('office');

        $query = User::query()->where('affiliation', 'Member');

        // Handle filtering by status
        if ($status) {
            if ($status === 'Rejected') {
                $query->where('status', 'Rejected')
                    ->where('membership_status', 'Rejected');
            } elseif ($status === 'Conditional Pre-approved') {
                $query->where('status', 'Conditional Pre-approved');
            } elseif ($status === 'Conditional Approved') {
                $query->where('status', 'Conditional Approved');
            } else {
                $query->where('status', $status);
            }
        } else {
            // Default status filter depending on role
            if ($role === 'Membership Committee') {
                $query->whereIn('status', ['Pending', 'Conditional Pre-approved']);
            } elseif ($role === 'President') {
                $query->whereIn('status', ['Pre-approved', 'Conditional Approved']);
            } elseif ($role === 'Treasurer') {
                $query->where('status', 'Approved')
                    ->where('membership_status', 'Pending');
            } else {
                $query->whereNotNull('status'); // fallback
            }
        }

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

        // Additional filters
        if ($request->filled('sex')) {
            $query->where('sex', $request->sex);
        }

        if ($request->filled('civil')) {
            $query->where('civil_status', $request->civil);
        }

        if ($request->filled('office')) {
            $query->where('office', $request->office);
        }

        if ($request->filled('birthdate')) {
            $query->where('birthdate', $request->birthdate); // fixed: was using $request->employment
        }

        // Sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc'); // ✅ default sort
        }

        return Inertia::render('member/members/applicants', [
            'users' => $query->paginate(5)->withQueryString(),
            'filterStatus' => $status,
            'offices' => $offices,
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function approvedApplicants(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'nullable|string|max:1000',
        ]);

        $user = User::findOrFail($id);

        // Check the role of the authenticated user
        if (auth()->user()->role === 'Membership Committee') {
            $user->status = 'Pre-approved';
        } elseif (auth()->user()->role === 'President') {
            $user->status = 'Approved';
            $user->membership_status = 'Pending';
        } else {
            abort(403, 'Unauthorized action.');
        }
        $user->remarks = $request->remarks;
        $user->save();

        Notification::create([
            'user_id' => $id,
            'type' => 'System',
            'title' => 'Application ' . $user->status,
            'body' => "Your application has been updated to {$user->status}.",
        ]);

        $fullName = $user->given_name . ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;

        try {
            $role = auth()->user()->role;

            if (in_array($role, ['Membership Committee', 'President'])) {
                Mail::to($user->email)->send(new SendApproval($fullName, $role, $user->status));
            } else {
                abort(403, 'Unauthorized action.');
            }

        } catch (\Exception $e) {
            // Log the error to the console (or to your log files)
            Log::error("Failed to send email to user ID {$user->id}: " . $e->getMessage());
        }
        return back()->with('success', 'User role updated successfully.');
    }

    public function rejectApplicants(Request $request, $id)
    {
        $request->validate([
            'remarks' => 'nullable|string|max:1000',
            'status' => 'required',
        ]);

        $user = User::findOrFail($id);
        $status = $request->status;
        if ($status === 'Reject') {
            $user->status = 'Rejected';
            $user->membership_status = 'Rejected';
        } else {
            $user->status = $status;
        }
        $user->remarks = $request->remarks;
        $user->save();

        $fullName = $user->given_name . ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;
        Notification::create([
            'user_id' => $id,
            'type' => 'System',
            'title' => 'Application ' . $user->status,
            'body' => "Your application has been rejected. {$request->remarks}",
        ]);
        try {
            Mail::to($user->email)->send(new SendRejected($fullName, auth()->user()->role, $status));
        } catch (\Exception $e) {
            // Log the error to the console (or to your log files)
            Log::error("Failed to send email to user ID {$user->id}: " . $e->getMessage());
        }
        return back()->with('success', 'User role updated successfully.');
    }

    public function changeRole(Request $request, $id)
    {
        $request->validate([
            'role' => [
                'required',
                'string',
                Rule::in([
                    'President',
                    'Treasurer',
                    'Human Resource Officer',
                    'Membership Committee',
                    'Election Committee',
                    'Public Information Officer',
                    'Member',
                    'Visitor'
                ]),
            ],
        ]);

        Notification::create([
            'user_id' => $id,
            'type' => 'System',
            'title' => 'User Role',
            'body' => "You have successfully updated your role to {$request->role}.",
        ]);

        $user = User::findOrFail($id);

        if ($request->role === 'Visitor') {
            $user->membership_status = 'Inactive';
        }

        if ($user->role === 'Visitor') {
            $user->membership_status = 'Active';
        }

        $user->role = $request->role;
        $user->save();

        return back()->with('success', 'User role updated successfully.');
    }

    public function changeStatus(Request $request, $id)
    {
        $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    'Approved',
                    'Rejected',
                    'Ended',
                ]),
            ],
        ]);

        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        return back()->with('success', 'User status updated successfully.');
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();


        return back()->with('success', 'User deleted successfully.');
    }

    public function notice()
    {
        $user = Auth::user();
        return inertia::render('announcements/notice', [
            'user' => $user
        ]);
    }

    public function store(Request $request)
    {

        try {
            $validated = $request->validate([
                // Personal Information
                'last_name' => 'required|string|max:255',
                'given_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'nickname' => 'nullable|string|max:255',
                'suffix' => 'nullable|string|max:10',
                'contact_number' => 'required|string|max:20',
                'email' => 'required|email|max:255|unique:users,email',
                'house_address' => 'required|string',
                'region' => 'required|string',
                'province' => 'required|string',
                'city' => 'required|string',
                'barangay' => 'required|string',
                // Demographics
                'birthdate' => 'required|string',
                'birthplace' => 'required|string|max:255',
                'sex' => 'required|in:Male,Female',
                'civil_status' => 'required|in:Single,Married,Widow/Widower,Separated',
                'spouse_name' => 'nullable|string|max:255',
                'religion' => 'nullable|string|max:255',

                // Education
                'education' => 'required|string',
                'college_degree' => 'nullable|string|max:255',
                'postgrad_degree' => 'nullable|string|max:255',

                // Employment
                'position' => 'nullable|string|max:255',
                'salary_grade' => 'nullable|string|max:255',
                'office' => 'nullable|string|max:255',
                'affiliation' => 'required|string',

                // Membership
                'physically_challenged' => 'required|boolean',
                'solo_parent' => 'required|boolean',
                'adoptive_couple' => 'required|boolean',
                'agreement' => 'required|boolean',
                'documents' => 'nullable|file|mimes:pdf|max:5120',
            ]);

            if ($request->hasFile('documents')) {
                $path = $request->file('documents')->store('documents', 'public');
                $validated['documents'] = $path;
            }

            // Generate a temporary password
            $temporaryPassword = Str::random(10);
            //$temporaryPassword = "password";

            $validated['password'] = Hash::make($temporaryPassword);

            $fullName = $validated['given_name'] . ' ' .
                ($validated['middle_name'] ? $validated['middle_name'] . ' ' : '') .
                $validated['last_name'];

            $profile = User::create($validated);

            Notification::create([
                'user_id' => $profile->id,
                'type' => 'System',
                'title' => 'Membership Registration',
                'body' => "Welcome {$fullName}, We are pleased to confirm that your registration with the Tagum City Government Employees' Union (TACGEU) was successful. Your membership application is now under review and pending approval by our Membership Committee. Once the review process is complete, we will notify you of the outcome and provide any further instructions regarding the next steps. Thank you for your interest in joining TACGEU. We look forward to having you as part of our community.",

            ]);

            try {
                Mail::to($profile->email)->send(new SendCredentials($fullName, $profile->email, $temporaryPassword));
            } catch (\Exception $e) {
                // Log the error to the console (or to your log files)
                Log::error("Failed to send email to Applicant {$fullName}: " . $e->getMessage());
            }
            return redirect()->route('login')->with('status', 'success');
        } catch (ValidationException $e) {
            logger()->error('Validation failed in console:', $e->errors()); // Shows in terminal
            Log::error('Validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);

            // Optional: rethrow to let Laravel handle it normally
            throw $e;
        }
    }

    public function print($id)
    {
        $profile = User::findOrFail($id);
        // Get President
        $president = User::where('role', 'President')->first();

        // Get Membership Committee members
        $membershipCommittee = User::where('role', 'Membership Committee')->first();

        return Inertia::render('print/PrintMembershipProfile', [
            'profile' => $profile,
            'president' => $president,
            'committee' => $membershipCommittee,
        ]);
    }
}