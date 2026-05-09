<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppSetting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    public function getTypedValueAttribute()
    {
        return match ($this->type) {
            'int', 'integer' => (int) $this->value,
            'bool', 'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'time' => $this->value,
            default => $this->value,
        };
    }
}
