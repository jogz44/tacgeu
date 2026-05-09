<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AppSetting;

class SettingsController extends Controller
{
    public function index()
    {
        $app_setting = AppSetting::all();
        return Inertia::render('settings/index', [
            'app_setting' => $app_setting,
        ]);
    }
    public function update(Request $request, $id)
    {
        $setting = AppSetting::findOrFail($id);

        $validated = $request->validate([
            'value' => 'required|string', // Adjust validation if needed based on type
        ]);

        $setting->value = $validated['value'];
        $setting->save();

        return redirect()->back()->with('success', 'Setting updated successfully.');
    }
}
