<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Vote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'election_id',
        'position_id',
        'candidate_id',
    ];

    // Relationships (optional)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function election()
    {
        return $this->belongsTo(Elections::class);
    }
    public function position()
    {
        return $this->belongsTo(Position::class);
    }
    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }
}
