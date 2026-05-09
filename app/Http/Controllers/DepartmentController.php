<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Department;

class DepartmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Department::query();
        // Filtering by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('settings/department', [
            'departments' => $query->paginate(5)->withQueryString(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
        ]);

        Department::create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Department added successfully.');
    }

    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
        ]);

        $department->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Department updated successfully.');
    }

    public function destroy($id)
    {
        $department = Department::findOrFail($id);

        $department->delete();
        return redirect()->back()->with('success', 'Elections deleted.');
    }

    public function list()
    {
        $departments = Department::all();

        return response()->json($departments);

    }
}
