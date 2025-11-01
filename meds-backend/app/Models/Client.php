<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = ['initials', 'dob', 'service_id'];

    protected $casts = [
        'dob' => 'date',
    ];
    
    public function courses()
        { 
            return $this->hasMany(MedicationCourse::class); 
        }

    public function service()
        {
            return $this->belongsTo(\App\Models\Service::class);
        }

}
