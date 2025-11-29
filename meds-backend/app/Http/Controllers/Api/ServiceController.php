<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        $services = Service::with('clients')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $services->map(function ($service) {
                return [
                    'id'   => $service->id,
                    'name' => $service->name,
                    'clients' => $service->clients->map(function ($client) {
                        return [
                            'id'       => $client->id,
                            'initials' => $client->initials,
                            'dob'      => optional($client->dob)->toDateString(),
                        ];
                    })->values(),
                ];
            }),
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required','string','min:1','max:255'],
        ]);

        $service = Service::create($validated);

        return response()->json([
            'message' => 'Service created',
            'data' => $service,
        ], 201);
    }

    public function show(Service $service)
    {

        return response()->json(['data' => $service]);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => ['required','string','min:1','max:255'],
        ]);

        $service->update($validated);

        return response()->json(['message' => 'Service updated', 'data' => $service]);
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(['message' => 'Service deleted']);
    }

    public function lookup()
    {
        return Service::select('id','name')
            ->orderBy('name')
            ->get();
    }
}
