<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function store(Request $r) {
        $data=$r->validate(['initials'=> 'required|string|max:10' , 'dob'=>'nullable|date']);
        return response()->json(Client::create($data),201);
    }
}
