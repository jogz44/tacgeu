<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expenses extends Model
{
    use HasFactory;

    // Define the table if it's not the plural form of the model
    protected $table = 'expenses';

    // Specify the attributes that are mass assignable
    protected $fillable = [
        'user_id', 
        'name', 
        'payee', 
        'check', 
        'description', 
        'amount', 
        'status', 
        'spent_at',
        'remarks',
        'documents',
    ];

    // Define relationships if needed (e.g., a user associated with this expense)
    public function user()
    {
        return $this->belongsTo(User::class);  // Expense belongs to a User
    }
}