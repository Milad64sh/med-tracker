<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model {
    protected $fillable=['course_id','type','fire_at','sent_at','external_id'];
    protected $casts=['fire_at'=>'datetime','sent_at'=>'datetime'];
    // app/Models/Schedule.php
    public function course() {
    return $this->belongsTo(MedicationCourse::class, 'course_id');
}

}
