<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest {
  public function rules(){
    return [
      'client_id'=>'required|exists:clients,id',
      'name'=>'required|string|max:120',
      'strength'=>'nullable|string|max:50',
      'form'=>'nullable|string|max:50',
      'dose_per_admin'=>'required|numeric|min:0.001',
      'admins_per_day'=>'required|numeric|min:0.001',
      'daily_use'=>'required|numeric|min:0.001',
      'pack_size'=>'required|integer|min:1',
      'packs_on_hand'=>'required|integer|min:0',
      'loose_units'=>'nullable|integer|min:0',
      'opening_units'=>'required|integer|min:0',
      'start_date'=>'required|date',
      'half_date'=>'nullable|date',
      'runout_date'=>'nullable|date',
      'status'=>'nullable|in:active,complete,paused',
    ];
  }
}
