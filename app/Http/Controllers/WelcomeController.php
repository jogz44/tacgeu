<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Announcement;

class WelcomeController extends Controller
{
    public function index()
    {
        $announcements = Announcement::active()
            ->orderByDesc('published_at')
            ->get();

        return Inertia::render('welcome', [
            'announcements' => $announcements
        ]);
    }
}
