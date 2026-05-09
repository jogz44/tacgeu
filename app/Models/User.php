<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        // Personal Information
        'last_name',
        'given_name',
        'middle_name',
        'nickname',
        'suffix',
        'contact_number',
        'email',
        'house_address',
        'region',
        'province',
        'city',
        'barangay',

        // Demographics
        'birthdate',
        'birthplace',
        'sex',
        'civil_status',
        'spouse_name',
        'religion',

        // Education
        'education',
        'college_degree',
        'postgrad_degree',

        // Employment Information
        'position',
        'salary_grade',
        'office',

        // Membership Info
        'physically_challenged',
        'solo_parent',
        'adoptive_couple',
        'agreement',
        'status',
        'password',
        'role',
        'membership_status',
        'affiliation',
        'is_first_log',
        'documents',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function employeePosition()
    {
        return $this->belongsTo(EmployeePosition::class);
    }
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}


