<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Collection extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'amount',
        'status',
    ];
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
