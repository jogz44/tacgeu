<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('settings/profile/update', [ProfileController::class, 'updateMember'])->name('profile.updateMember');
    // Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::put('settings/profile/resign', [ProfileController::class, 'resign'])->name('profile.resign');
    Route::post('settings/profile/reactivate', [ProfileController::class, 'reactivate'])->name('profile.reactivate');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');
});
