<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'initials'   => $this->initials,
            'client_name' => $this->client_name,
            'dob'        => optional($this->dob)->toDateString(), 
            'gp_email'   => $this->gp_email,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'courses'    => CourseResource::collection($this->whenLoaded('courses')),
            'service'    => [
                'id'   => $this->service_id,
                'name' => $this->whenLoaded('service', fn () => $this->service?->name),
            ],
        ];
    }
}
