<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest {
  public function rules(){ 
    return [
      'initials'   => 'required|string|max:10',
      'client_name' => 'nullable|string|max:255',
      'dob'        => 'nullable|date',
      'service_id' => 'required|integer|exists:services,id',
      'gp_email'   => 'nullable|email|max:255',
    ];
  }
}
