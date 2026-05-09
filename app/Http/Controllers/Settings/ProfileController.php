<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Http\Requests\Settings\MemberUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use App\Mail\PendingWithdrawMail;
use App\Mail\ReactivationMail;
use Illuminate\Validation\Rule;
use App\Models\User;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->except('image'));
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('profile', 'public');
            $user->image = $path;
        }

        if ($request->hasFile('documents')) {
            $path = $request->file('documents')->store('documents', 'public');
            $user->documents = $path;
        }

        // Modify status based on current value
        if ($user->status === 'Conditional Pre-approved') {
            $user->status = 'Pending';
            $user->remarks = '';
        } elseif ($user->status === 'Conditional Approved') {
            $user->status = 'Pre-approved';
            $user->remarks = '';
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('profile.edit');
    }

    public function updateMember(Request $request): RedirectResponse
    {
        $request->validate([
            'image' => ['nullable', 'image', 'max:5120'],
            'given_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:255'],
            'house_address' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($request->input('id')),
            ],

            // Demographics
            'birthdate' => ['nullable', 'date'],
            'birthplace' => ['nullable', 'string', 'max:255'],
            'sex' => ['nullable', 'in:Male,Female'],
            'civil_status' => ['nullable', 'in:Single,Married,Widow/Widower,Separated'],
            'spouse_name' => ['nullable', 'string', 'max:255'],
            'religion' => ['nullable', 'string', 'max:255'],

            // Education
            'education' => ['nullable', 'string', 'max:255'],
            'college_degree' => ['nullable', 'string', 'max:255'],
            'postgrad_degree' => ['nullable', 'string', 'max:255'],

            // Employment Information
            'position' => ['nullable', 'string', 'max:255'],
            'salary_grade' => ['nullable', 'string', 'max:255'],
            'office' => ['nullable', 'string', 'max:255'],

            // Membership Info
            'physically_challenged' => ['required', 'boolean'],
            'solo_parent' => ['required', 'boolean'],
            'adoptive_couple' => ['required', 'boolean'],
        ]);

        $user = User::findOrFail($request->input('id'));

        $user->fill($request->except('image'));
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('profile', 'public');
            $user->image = $path;
        }

        if ($request->hasFile('documents')) {
            $path = $request->file('documents')->store('documents', 'public');
            $user->documents = $path;
        }

        // Modify status based on current value
        if ($user->status === 'Conditional Pre-approved') {
            $user->status = 'Pending';
            $user->remarks = '';
        } elseif ($user->status === 'Conditional Approved') {
            $user->status = 'Pre-approved';
            $user->remarks = '';
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('membersUpdate', ['id' => $user->id]);
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // Log uploaded file for debugging
        if ($request->hasFile('image')) {
            Log::info('Uploading image: ' . $request->file('image')->getClientOriginalName());

            $path = $request->file('image')->store('profile-images', 'public');
            $data['image'] = $path;
        }

        // Email verification logic
        if (isset($data['email']) && $data['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->fill($data)->save();

        return to_route('profile.edit');
    }

    public function resign(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
            'remarks' => ['required', 'string'],
        ]);

        $user = Auth::user();

        // Validate password
        if (!Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'The password you entered is incorrect.']);
        }

        // Update status
        $user->status = 'Resigned';
        $user->remarks = $request->remarks;
        $user->save();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'System',
            'title' => 'Membership Withdrawal',
            'body' => "Your membership withdrawal application has been submitted and is now pending approval.",
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



        return to_route('profile.edit')->with('success', 'Your resignation request has been submitted.');
    }

    public function reactivate(Request $request): RedirectResponse
    {
        $request->validate([
            'documents' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        $user = Auth::user();

        if ($request->hasFile('documents')) {
            $path = $request->file('documents')->store('documents', 'public');
            $user->documents = $path;
        }

        // Update status
        $user->status = 'Pending';
        $user->role = 'Visitor';
        $user->membership_status = 'Pending';
        $user->remarks = $request->remarks;
        $user->save();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'System',
            'title' => 'Membership Reactivation Request',
            'body' => 'Your membership reactivation request has been submitted and is now pending approval.',
        ]);

        $fullName = $user->given_name . ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;

        try {
            $role = auth()->user()->role;

            if (in_array($role, ['Membership Committee', 'President'])) {
                Mail::to($user->email)->send(new ReactivationMail($fullName, $role, $user->status));
            } else {
                abort(403, 'Unauthorized action.');
            }
        } catch (\Exception $e) {
            Log::error("Failed to send email to Applicant {$fullName}: " . $e->getMessage());
        }

        return to_route('profile.edit')->with('success', 'Your reactivation request has been submitted.');
    }

}
