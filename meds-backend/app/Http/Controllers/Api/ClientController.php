<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Resources\ClientResource;

class ClientController extends Controller
{
    public function store(StoreClientRequest $req) {
    $client = \App\Models\Client::create($req->validated());
    $client->load('service', 'courses');
    return (new ClientResource($client))
        ->response()
        ->setStatusCode(201);
    }

    public function index()
{
    $clients = \App\Models\Client::with('service')->orderBy('created_at','desc')->paginate(20);
    // If you have a ClientResource, return it as a collection:
    return ClientResource::collection($clients);
}

public function show(\App\Models\Client $client)
{
    $client->load('service','courses');
    return new ClientResource($client);
}
}
