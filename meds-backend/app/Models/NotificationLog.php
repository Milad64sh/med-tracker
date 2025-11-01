<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model {
    protected $fillable=['course_id','channel','to_address','payload','sent_at','status','error'];
    protected $casts=['payload'=>'array','sent_at'=>'datetime'];
    public function course(){ return $this->belongsTo(MedicationCourse::class); }
}
