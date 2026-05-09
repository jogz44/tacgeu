<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Candidate extends Model
{
    protected $fillable = [
        'user_id',
        'election_id',
        'position_id',
        'status',
    ];
    public function user()
    {
        return $this->belongsTo(User::class);  // Candidate belongs to a User
    }
    public function election()
    {
        return $this->belongsTo(Elections::class);  // Candidate belongs to a Elections
    }
    public function position()
    {
        return $this->belongsTo(Position::class);  // Candidate belongs to a Position
    }
}
