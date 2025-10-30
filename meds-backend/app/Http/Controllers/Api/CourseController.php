<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicationCourse;
use App\Services\CourseService;
use App\Services\ScheduleService;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function store(Request $r, CourseService $cs, ScheduleService $ss){
        $d=$r->validate([
            'client_id'=>'required|uuid|exists:clients,id',
            'name'=>'required|string','strength'=>'nullable|string','form'=>'nullable|string',
            'dose_per_admin'=>'required|numeric|min:0.001','admins_per_day'=>'required|numeric|min:0.001',
            'pack_size'=>'required|integer|min:1','packs_on_hand'=>'required|integer|min:0','loose_units'=>'nullable|integer|min:0',
            'start_date'=>'required|date','status'=>'nullable|string|in:active,completed,paused',
        ]);
        $c=new MedicationCourse(['client_id'=>$d['client_id']]);
        $c=$cs->fillAndSave($c,$d);
        $ss->reschedule($c);
        return response()->json($c->load('client'),201);
    }
}
