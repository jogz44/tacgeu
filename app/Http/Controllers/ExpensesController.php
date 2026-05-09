<?php

namespace App\Http\Controllers;

use App\Models\Expenses;  // Assuming you have a corresponding model for the expenses
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\ExpensesMail; // Import the correct Mailable class
use App\Models\User; // Import the User model

class ExpensesController extends Controller
{
    // Display a list of all expenses
    public function index(Request $request)
    {
        $status = $request->status; // Get the status from the request

        $query = Expenses::with('user')
            ->join('users', 'expenses.user_id', '=', 'users.id')
            ->select('expenses.*');;
        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('payee', 'like', "%{$search}%");
            });
        }

        // Filtering by status
        if ($request->filled('status')) {
            $query->where('expenses.status', $request->status);
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('expenses.created_at', 'desc'); // Default sorting
        }

        // Paginate
        return Inertia::render('expenses/expenses', [
            'expenses' => $query->paginate(5)->withQueryString(),
            'filteredStatus' => $status
        ]);
    }

    // Store a newly created expense in the database
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'payee' => 'required|string|max:255',
            'check' => 'required|string|max:255',
            'description' => 'required|string',
            'amount' => 'required|numeric',
            'spent_at' => 'nullable|date',
            'documents' => 'nullable|file|mimes:pdf|max:5120', // max 5MB PDF
        ]);

        $validated['user_id'] = $request->user()->id;
        // Handle file upload if present
        if ($request->hasFile('documents')) {
            $path = $request->file('documents')->store('expenses', 'public');
            $validated['documents'] = $path; // assuming 'documents' column exists in DB
        }

        $expense = Expenses::create($validated)->fresh('user');   // Create a new expense record
        // Send an email to the president with the expense details

        $president = User::where('role', 'President')->first();
        $presidentName = $president->given_name . ' ' .
            ($president->middle_name ? $president->middle_name . ' ' : '') .
            $president->last_name;
        try {
            Mail::to($president->email)->send(new ExpensesMail($expense, $presidentName)); // Ensure ExpensesMail is a valid Mailable
        } catch (\Exception $e) {
            // Log the error to the console (or to your log files)
            Log::error("Failed to send email Notification : " . $e->getMessage());
        }
        // Save the validated data to the database

        return redirect()->route('expenses')->with('success', 'Expense created successfully!');
    }

    // Update the specified expense in the database
    public function updateStatus(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:expenses,id', // Ensure the expense exists
            'status' => 'required|in:Pending,Approved,Rejected,Canceled',
            'remarks' => 'nullable|string',
        ]);

        $expense = Expenses::with('user')->findOrFail($validated['id']);

        $expense->update([
            'status' => $validated['status'],
            'remarks' => $validated['remarks'],
        ]);

        $expense = $expense->fresh('user'); // Reload the expense with the user relationship

        $president = User::where('role', 'President')->first();

        // Determine sender name
        if (in_array($validated['status'], ['Approved', 'Rejected'])) {
            $sender = $expense->user; // the creator
        } else {
            $sender = $president; // the president
        }

        $senderName = $sender->email;

        $presidentName = $president->given_name . ' ' .
            ($president->middle_name ? $president->middle_name . ' ' : '') .
            $president->last_name;
        try {
            Mail::to($senderName)->send(new ExpensesMail($expense, $presidentName));
        } catch (\Exception $e) {
            // Log the error to the console (or to your log files)
            Log::error("Failed to send email Notification : " . $e->getMessage());
        }

        return redirect()->route('expenses')->with('success', 'Expense updated successfully!');
    }

    // Remove the specified expense from the database
    public function destroy(Expenses $expense)
    {
        $expense->delete();  // Delete the expense record

        return redirect()->route('expenses')->with('success', 'Expense deleted successfully!');
    }
}
