<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;

class ClientController extends Controller
{
    public function store(StoreClientRequest $req) {
        $client = Client::create($req->validated());
        $client->load('service', 'courses');
        return (new ClientResource($client))
            ->response()
            ->setStatusCode(201);
    }

    public function index()
    {
        $clients = Client::with('service:id,name', 'courses')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return ClientResource::collection($clients);
    }

    public function show(Client $client)
    {
        $client->load('service','courses');
        return new ClientResource($client);
    }

    public function lookup()
    {
        return Client::with('service:id,name')
            ->select('id', 'initials', 'dob', 'gp_email', 'service_id')
            ->orderBy('initials')
            ->get();
    }

    public function update(\Illuminate\Http\Request $req, Client $client)
    {
                // dd($req->all());
        $data = $req->validate([
            'initials'   => ['required','string','max:50'],
            'dob'        => ['nullable','date'],
            'service_id' => ['nullable','integer','exists:services,id'],
            'gp_email'   => ['nullable','email','max:255'],
        ]);

        $client->update($data);
        $client->load('service','courses');
        return new ClientResource($client);
    }

    public function destroy(Client $client)
    {
        $client->delete();

        // 204 No Content 
        return response()->noContent();
    }
}
