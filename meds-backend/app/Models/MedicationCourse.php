<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicationCourse extends Model
{
    protected $fillable = [
        'client_id',
        'name',
        'strength',
        'form',
        'dose_per_admin',
        'admins_per_day',
        'daily_use',
        'pack_size',
        'packs_on_hand',
        'loose_units',
        'opening_units',
        'start_date',
        'half_date',
        'runout_date',
        'status'
    ];
    protected $casts = [
        'dose_per_admin'=>'float',
        'admins_per_day'=>'float',
        'daily_use'=>'float',
        'start_date'=>'date',
        'half_date'=>'date',
        'runout_date'=>'date',
        'acknowledged_at' => 'datetime',
        'snoozed_until'   => 'datetime',
    ];
    public function client()
    { 
        return $this->belongsTo(Client::class); 
    }

    public function schedules()
     {
        return $this->hasMany(Schedule::class, 'course_id');
    }

    public function ackUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'acknowledged_by');
    }

    public function snoozeUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'snoozed_by');
    }

}

