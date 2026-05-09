<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    // Relationship: Notification belongs to a User
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function notification(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
