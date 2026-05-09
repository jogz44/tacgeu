<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
   protected $fillable = [
        'position',
        'slots',
        'election_id',
    ];

    public function election()
    {
        return $this->belongsTo(Elections::class);  // Expense belongs to a User
    }
}
