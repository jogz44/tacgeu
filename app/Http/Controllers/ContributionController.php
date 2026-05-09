<?php

namespace App\Http\Controllers;

use App\Models\Contributions;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Mail\SendContribution;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;
use Carbon\Carbon;
class ContributionController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('status', 'Approved')
            ->where('membership_status', 'Active')
            ->where('affiliation', 'member')
            ->get();

        $availableYears = Contributions::selectRaw('DISTINCT year')
            ->whereNotNull('year')
            ->orderByRaw('CAST(year AS UNSIGNED) DESC')
            ->pluck('year');

        // Contributions query with eager loading
        $contributionsQuery = Contributions::with('user')
            ->join('users', 'contributions.user_id', '=', 'users.id')
            ->select('contributions.*');

        // Search filter: apply to related user fields
        if ($request->filled('search')) {
            $search = $request->search;
            $contributionsQuery->whereHas('user', function ($q) use ($search) {
                $q->where('given_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%");
            });
        }

        // Filter by month
        if ($request->filled('month')) {
            $month = $request->month;
            $contributionsQuery->whereHas('user', function ($q) use ($month) {
                $q->where('month', $month);
            });
        }

        // Filter by year
        if ($request->filled('year')) {
            $year = $request->year;
            $contributionsQuery->whereHas('user', function ($q) use ($year) {
                $q->where('year', $year);
            });
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');

            if ($request->sortBy === 'month' || $request->sortBy === 'year') {
                $contributionsQuery->orderByRaw("CAST(COALESCE({$request->sortBy}, 0) AS UNSIGNED) {$direction}");
            } else {
                $contributionsQuery->orderBy($request->sortBy, $direction);
            }
        } else {
            // Default sorting: year then month (numerically)
            // $contributionsQuery->orderByRaw('CAST(COALESCE(year, 0) AS UNSIGNED) DESC')
            //     ->orderByRaw('CAST(COALESCE(month, 0) AS UNSIGNED) DESC');
            $contributionsQuery->orderBy('created_at', 'desc');
        }

        // 🔥 CLONE BEFORE PAGINATE
        $exportQuery = clone $contributionsQuery;

        $contributions = $contributionsQuery
            ->paginate(10)
            ->withQueryString();

        $export = $exportQuery->get();

        return Inertia::render('contribution/contribution', [
            'contribution' => $contributions,
            'users' => $users,
            'availableYears' => $availableYears,
            'filters' => $request->only(['search', 'month', 'year', 'sortBy', 'direction']),
            'export' => $export,
        ]);
    }

    public function contribution()
    {
        $userId = Auth::id();

        $contributions = Contributions::with('user')
            ->where('user_id', $userId)
            ->orderByRaw('CAST(year AS UNSIGNED) desc')
            ->orderByRaw('CAST(month AS UNSIGNED) desc')
            ->get();

        return Inertia::render('contribution/member', [
            'contribution' => $contributions, // existing data 
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|string',
            'year' => 'required|digits:4',
            'amount' => 'required|numeric',
        ]);
        $validated['status'] = 'Paid';

        Contributions::create($validated);

        $user = User::findOrFail($validated['user_id']); // Retrive user details based on user_id
        $fullName = $user->given_name . ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;

        $monthName = Carbon::createFromFormat('!m', $validated['month'])->format('F');
        //Notify User
        Notification::create([
            'user_id' => $user->id,
            'type' => 'Contribution',
            'title' => 'Monthly Contribution Payment',
            'body' => 'Dear member, your monthly contribution for ' . $monthName . ' ' . $validated['year'] . ' has been successfully received. Thank you for your continued support.',
            'is_read' => false,
        ]);

        try {
            // Pass the required arguments to the SendContribution mailable
            Mail::to($user->email)->send(new SendContribution($fullName, $validated));
        } catch (\Exception $e) {
            // Log the error to the console (or to your log files)
            Log::error("Failed to send email to Applicant {$fullName}: " . $e->getMessage());
        }


        return redirect()->route('contributions')->with('success', 'Monthly due recorded.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|string',
            'year' => 'required|digits:4',
            'amount' => 'required|numeric',
        ]);

        $contribution = Contributions::findOrFail($id);

        // Update contribution data
        $contribution->update([
            'user_id' => $validated['user_id'],
            'month' => $validated['month'],
            'year' => $validated['year'],
            'amount' => $validated['amount'],
            'status' => 'Paid',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $fullName = $user->given_name . ' ' .
            ($user->middle_name ? $user->middle_name . ' ' : '') .
            $user->last_name;

        $monthName = Carbon::createFromFormat('!m', $validated['month'])->format('F');

        // Notify User
        Notification::create([
            'user_id' => $user->id,
            'type' => 'Contribution',
            'title' => 'Monthly Contribution Updated',
            'body' => 'Dear member, your monthly contribution for ' . $monthName . ' ' . $validated['year'] . ' has been updated. Thank you.',
            'is_read' => false,
        ]);

        try {
            Mail::to($user->email)->send(new SendContribution($fullName, $validated));
        } catch (\Exception $e) {
            Log::error("Failed to send email to Applicant {$fullName}: " . $e->getMessage());
        }

        return redirect()->route('contributions')->with('success', 'Monthly contribution updated.');
    }

    public function import(Request $request)
    {
        $data = $request->input('data');
        // 1. Check required columns
        $requiredColumns = ['id', 'month', 'year', 'amount'];

        foreach ($data as $index => $row) {
            foreach ($requiredColumns as $column) {
                if (!array_key_exists($column, $row)) {
                    return redirect()->back()->withErrors([
                        "Row " . ($index + 1) . " is missing required column: $column"
                    ]);
                }
            }
        }
        // 2. Validate and insert
        foreach ($data as $index => $row) {
            $userId = $row['id'];
            $month = $row['month'];
            $year = $row['year'];

            // Check if already paid
            $exists = Contributions::where('user_id', $userId)
                ->where('month', $month)
                ->where('year', $year)
                ->exists();

            if ($exists) {
                continue; // Skip duplicates
            }

            // Optional: Validate user exists
            if (!User::find($userId)) {
                continue; // Skip if user doesn't exist
            }

            Contributions::create([
                'user_id' => $userId,
                'month' => $month,
                'year' => $year,
                'amount' => $row['amount'],
                'status' => 'Paid',
            ]);
        }

        return redirect()->back()->with('success', 'CSV imported successfully');
    }

    public function membersContribution($userId)
    {
        $monthNames = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'May',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Aug',
            9 => 'Sep',
            10 => 'Oct',
            11 => 'Nov',
            12 => 'Dec',
        ];

        $years = Contributions::where('user_id', $userId)
            ->select('year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->get();

        $data = [];

        foreach ($years as $yearRow) {
            $year = $yearRow->year;

            // Get contributions for this year
            $records = Contributions::where('user_id', $userId)
                ->where('year', $year)
                ->get()
                ->keyBy('month'); // so we can access by month number

            // Build row: year + months
            $row = ['year' => $year];
            foreach ($monthNames as $num => $name) {
                if (isset($records[$num])) {
                    $row[$name] = $records[$num]->status === 'Paid'
                        ? '₱' . $records[$num]->amount
                        : 'Unpaid';
                } else {
                    $row[$name] = 'Unpaid'; // default if no record
                }
            }

            $data[] = $row;
        }

        return response()->json($data);
    }

    public function destroy($id)
    {
        $contribution = Contributions::findOrFail($id);
        $user = $contribution->user;

        $contribution->delete();

        // Optionally notify user
        Notification::create([
            'user_id' => $user->id,
            'type' => 'Contribution',
            'title' => 'Monthly Contribution Deleted',
            'body' => 'Dear member, your contribution record has been deleted.',
            'is_read' => false,
        ]);

        return redirect()->route('contributions')->with('success', 'Contribution deleted successfully.');
    }
}