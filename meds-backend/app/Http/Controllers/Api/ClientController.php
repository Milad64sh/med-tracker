<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Resources\ClientResource;

class ClientController extends Controller
{
    public function store(StoreClientRequest $req) {
    $client = \App\Models\Client::create($req->validated());
    return (new ClientResource($client))
        ->response()
        ->setStatusCode(201);
}
}
