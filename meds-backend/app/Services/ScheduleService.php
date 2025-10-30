<?php
namespace App\Services;
use App\Models\MedicationCourse;
use App\Models\Schedule;
use Carbon\Carbon;

class ScheduleService {
  public function reschedule(MedicationCourse $c): void {
    Schedule::where('course_id',$c->id)->delete();
    foreach (['half'=>$c->half_date, 'runout'=>$c->runout_date] as $type=>$date) {
      Schedule::create([
        'course_id'=>$c->id,
        'type'=>$type,
        'fire_at'=>Carbon::parse($date.' 09:00 Europe/London')->utc(),
      ]);
    }
  }
}