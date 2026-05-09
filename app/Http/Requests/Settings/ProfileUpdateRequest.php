<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Personal Information
            'image' => ['nullable', 'image', 'max:5120'], //5mb max file size
            'given_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'nickname' => ['nullable', 'string', 'max:255'],
            'house_address' => ['nullable', 'string', 'max:255'],
            'region' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'barangay' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],

            // Demographics
            'birthdate' => ['nullable', 'date'],
            'birthplace' => ['nullable', 'string', 'max:255'],
            'sex' => ['nullable', 'in:Male,Female'],
            'civil_status' => ['nullable', 'in:Single,Married,Widow/Widower,Separated'],
            'spouse_name' => ['nullable', 'string', 'max:255'],
            'religion' => ['nullable', 'string', 'max:255'],

            // Education
            'education' => ['nullable', 'string', 'max:255'],
            'college_degree' => ['nullable', 'string', 'max:255'],
            'postgrad_degree' => ['nullable', 'string', 'max:255'],

            // Employment Information
            'position' => ['nullable', 'string', 'max:255'],
            'salary_grade' => ['nullable', 'string', 'max:255'],
            'office' => ['nullable', 'string', 'max:255'],

            // Membership Info
            'physically_challenged' => ['required', 'boolean'],
            'solo_parent' => ['required', 'boolean'],
            'adoptive_couple' => ['required', 'boolean'],
        ];
    }
    protected function prepareForValidation()
    {
        \Log::info('ProfileUpdateRequest triggered for user:', [
            'user_id' => $this->user()?->id,
            'email' => $this->user()?->email,
            'timestamp' => now(),
        ]);
    }
}