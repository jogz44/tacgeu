<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Elections extends Model
{
    //
    use HasFactory;

    // Define the table if it's not the plural form of the model
    protected $table = 'elections';

    // Specify the attributes that are mass assignable
    protected $fillable = [
        'title',
        'participants',
        'voters',
        'filing_start_date',
        'filing_end_date',
        'start_date',
        'end_date',
        'user_id',
        'status',
        'remarks',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);  // Expense belongs to a User
    }
}
