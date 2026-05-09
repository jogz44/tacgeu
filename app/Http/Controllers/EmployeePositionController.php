<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\EmployeePosition;

class EmployeePositionController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeePosition::query();
        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            });
        }

        return Inertia::render('settings/position', [
            'positions' => $query->paginate(perPage: 5)->withQueryString(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255|unique:member_positions,title',
        ]);

        EmployeePosition::create([
            'title' => $request->title,
        ]);

        return redirect()->back()->with('success', 'Position added successfully.');
    }

    public function update(Request $request, $id)
    {
        $position = EmployeePosition::findOrFail($id);
        $request->validate([
            'title' => 'required|string|max:255|unique:member_positions,title,' . $id,
        ]);

        $position->update([
            'title' => $request->title,
        ]);

        return redirect()->back()->with('success', 'Position updated successfully.');
    }

    public function destroy($id)
    {
        $position = EmployeePosition::findOrFail($id);
        $position->delete();

        return redirect()->back()->with('success', 'Position deleted successfully.');
    }

    public function list()
    {
        $positions = EmployeePosition::all();

        return response()->json($positions);

    }

}
