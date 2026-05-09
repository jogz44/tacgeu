<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Collection;
use App\Models\Payment;

class CollectionController extends Controller
{
    public function index(Request $request)
    {

        $query = Collection::query();

        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Optional sorting
        if ($request->filled('sortBy')) {
            $direction = $request->get('direction', 'asc');
            $query->orderBy($request->sortBy, $direction);
        } else {
            $query->orderBy('created_at', 'desc'); // Default sorting
        }
        // Paginate
        return Inertia::render('payment/collections', [
            'collections' => $query->paginate(5)->withQueryString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric',
        ]);

        Collection::create($validated);

        return redirect()->route('collections')->with('success', 'Collection is recorded.');
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'id' => 'required|exists:collections,id',
            'name' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric',
        ]);

        $collection = Collection::findOrFail($validated['id']);
        $collection->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
        ]);

        return redirect()->route('collections')->with('success', 'Collection is updated.');
    }

    public function destroy($id)
    {
        $collection = Collection::findOrFail($id);

        $alreadyExist = Payment::where('collection_id', $id)
            ->exists();

        if ($alreadyExist) {
            return redirect()->back()
                ->withInput()
                ->withErrors(['error' => 'This collection already has a payment record.']);
        }

        $collection->delete();

        return redirect()->route('collections')->with('success', 'Collection has been deleted.');
    }
}

