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
use App\Models\Notification;
use App\Mail\SendRejected;
use App\Mail\SendApproval;
use App\Mail\SendCredentials;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('member/roles/index', [
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
                'sex' => 'required|in:Male,Female',

                // Education
                'education' => 'required|string',
                'college_degree' => 'nullable|string|max:255',
                'postgrad_degree' => 'nullable|string|max:255',

                // Employment
                'position' => 'nullable|string|max:255',
                'salary_grade' => 'nullable|string|max:255',
                'office' => 'nullable|string|max:255',
            ]);

            // Generate a temporary password
            //$temporaryPassword = Str::random(10);
            $temporaryPassword = "password";
            $validated['affiliation'] = "Officer";

            $validated['password'] = Hash::make($temporaryPassword);

            $fullName = $validated['given_name'] . ' ' .
                ($validated['middle_name'] ? $validated['middle_name'] . ' ' : '') .
                $validated['last_name'];

            $profile = User::create($validated);

            Notification::create([
                'user_id' => $profile->id,
                'type' => 'System',
                'title' => 'Officer Registration',
                'body' => "Welcome {$fullName}, We are pleased to confirm that your registration as officer with the Tagum City Government Employees' Union (TACGEU) was successful. Your account is now under review and pending approval by our President. the system will notify you once the review process is complete.",

            ]);
            try {
                Mail::to($profile->email)->send(new SendCredentials($fullName, $profile->email, $temporaryPassword));
            } catch (\Exception $e) {
                // Log the error to the console (or to your log files)
                Log::error("Failed to send email to Applicant {$fullName}: " . $e->getMessage());
            }
            return back()->with([
                'status' => 'success',
            ]);
        } catch (ValidationException $e) {
            logger()->error('Validation failed in console:', $e->errors()); // Shows in terminal
            Log::error('Validation failed', [
                'errors' => $e->errors(),
                'input' => $request->all(),
            ]);

            // Optional: rethrow to let Laravel handle it normally
            return back()->with([
                'status' => 'error',
            ]);
        }
    }

    public function update(Request $request, $id)
    {

        return redirect()->back()->with('success', 'Position updated successfully.');
    }

    public function destroy($id)
    {


        return redirect()->back()->with('success', 'Position deleted successfully.');
    }

}
