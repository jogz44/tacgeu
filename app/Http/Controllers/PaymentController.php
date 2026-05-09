<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Payment;
use App\Models\User;
use App\Models\Collection;
use App\Models\Notification;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $collections = Collection::all();

        $users = User::where('status', 'Approved')
            ->where('membership_status', '!=', 'Rejected')
            ->where('affiliation', 'member')
            ->get();

        $query = Payment::with(['user', 'collection'])
            ->join('users', 'payments.user_id', '=', 'users.id')
            ->join('collections', 'payments.collection_id', '=', 'collections.id')
            ->select('payments.*', 'collections.name as collection_name');

        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('collections.name', 'like', "%{$search}%")
                    ->orWhere('users.given_name', 'like', "%{$search}%")
                    ->orWhere('users.last_name', 'like', "%{$search}%")
                    ->orWhere('users.middle_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('collection_id')) {
            $query->where('collections.name', $request->collection_id);
        }

        // 📅 Filter by created_at date
        // if ($request->filled('created_at')) {
        //     $query->whereDate('payments.created_at', $request->created_at);
        // }
        // 📅 Filter by transaction_at date
        if ($request->filled('transaction_at')) {
            $query->whereDate('payments.transaction_at', $request->transaction_at);
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('payments.created_at', 'desc'); // Default sorting
        }

        $exportQuery = clone $query;

        $payments = $query
            ->paginate(10)
            ->withQueryString();

        $export = $exportQuery->get();

        // Paginate
        return Inertia::render('payment/payments', [
            'payments' => $payments,
            'users' => $users,
            'collections' => $collections,
            'export' => $export,
        ]);
    }

    // Create a new payment
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'collection_id' => 'required|exists:collections,id',
            'amount' => 'required|numeric|min:0',
            'transaction_at' => 'required|date',
        ]);

        // Check if user already paid for this collection
        $user = User::findOrFail($validated['user_id']);

        if ($user->membership_status !== 'Pending') {
            $alreadyPaid = Payment::where('user_id', $validated['user_id'])
                ->where('collection_id', $validated['collection_id'])
                ->exists();
            if ($alreadyPaid) {
                return redirect()->back()
                    ->withInput()
                    ->withErrors(['user_id' => 'This user has already paid for this collection.']);
            }
        }

        // If the selected collection is marked as 'Default',
        // automatically activate the user's membership.
        $collection = Collection::findOrFail($validated['collection_id']);
        if ($collection->status === 'Default') {
            $user = User::findOrFail($validated['user_id']);
            $user->role = 'Member';
            $user->membership_status = 'Active';
            $user->save();
        }

        Payment::create($validated);
        //Notify Member
        $transactionDate = Carbon::parse($validated['transaction_at']);
        Notification::create([
            'user_id' => $validated['user_id'],
            'type' => 'Payment',
            'title' => $collection->name,
            'body' => 'Dear member, your payment for the ' . $collection->name . ' transaction date ' . $transactionDate->format('F Y') . ' has been successfully received. Thank you for your support.',
            'is_read' => false,
        ]);

        return redirect()->route('payments')->with('success', 'Payments deleted successfully!');
    }

    // Update payment
    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'collection_id' => 'required|exists:collections,id',
            'amount' => 'required|numeric|min:0',
            'transaction_at' => 'required|date',
        ]);

        // Check if user already paid for this collection
        // $alreadyPaid = Payment::where('user_id', $validated['user_id'])
        //     ->where('collection_id', $validated['collection_id'])
        //     ->exists();

        // if ($alreadyPaid) {
        //     return redirect()->back()
        //         ->withInput()
        //         ->withErrors(['user_id' => 'This user has already paid for this collection.']);
        // }

        $payment->update($validated);
        return redirect()->route('payments')->with('success', 'Payments updated successfully!');
    }

    // Delete payment
    public function destroy($id)
    {
        $payment = Payment::findOrFail($id);
        $payment->delete();
        return redirect()->route('payments')->with('success', 'Payments deleted successfully!');
    }


}
