<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = ['initials', 'dob'];

    protected $casts = [
        'dob' => 'date',
    ];
}
