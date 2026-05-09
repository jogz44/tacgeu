<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmployeePosition extends Model
{
    use HasFactory;

    protected $table = 'member_positions';

    protected $fillable = ['title'];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
