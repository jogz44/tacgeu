<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function notifications()
    {
        $userId = Auth::id();

        // Query announcements
        $announcements = DB::table('announcements')
            ->select(
                'id',
                'title',
                DB::raw("CONCAT(body, ' (Scheduled on: ', DATE_FORMAT(scheduled_at, '%M %d, %Y'), ')') as body"),
                'type',
                DB::raw("'announcement' as source"),
                'status',
                'scheduled_at',
                'published_at',
                'created_at',
                DB::raw('false as is_read') // <-- add default value here
            )
            ->where('status', 'active');

        // Query user-specific notifications
        $userNotifications = DB::table('notifications')
            ->select(
                'id',
                'title',
                'body',
                'type',
                DB::raw("'notification' as source"),
                DB::raw("'active' as status"), // default value for status
                DB::raw('NULL as scheduled_at'),
                DB::raw('NULL as published_at'),
                'created_at',
                'is_read'
            )
            ->where('user_id', $userId);

        // Combine both queries with union
        $combined = $announcements
            ->unionAll($userNotifications)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        return response()->json($combined);
    }

    public function markAllRead(Request $request)
    {
        $user = auth()->user();

        $user->notifications()->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'type' => 'nullable|string|max:50',
        ]);

        $notification = Notification::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'body' => $validated['body'],
            'type' => $validated['type'] ?? null,
            'is_read' => false, // default unread
        ]);

        return response()->json([
            'success' => true,
            'notification' => $notification
        ]);
    }
}
