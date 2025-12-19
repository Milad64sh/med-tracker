<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestockLog extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'client_id',
        'action',
        'before',
        'after',
        'restock_date'
    ];

    protected $casts = [
        'before' => 'array',
        'after' => 'array',
        'restock_date' => 'date',
    ];

    // who did it
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // which medication course
    public function course()
    {
        return $this->belongsTo(MedicationCourse::class, 'course_id');
    }

    // which client
    public function client()
    {
        return $this->belongsTo(Client::class);
    }


}
