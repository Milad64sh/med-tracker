<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest {
  public function rules(){ 
    return [
      'initials'=>'required|string|max:10',
      'dob'=>'nullable|date'
    ];
  }
}
