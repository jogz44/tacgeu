<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    protected $fillable = [
        'image',
        'title',
        'body',
        'type',
        'status',
        'published_at',
        'scheduled_at',
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
