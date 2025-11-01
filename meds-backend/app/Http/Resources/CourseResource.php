<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'name' => $this->name,
            'strength' => $this->strength,
            'form' => $this->form,
            'dose_per_admin' => (float)$this->dose_per_admin,
            'admins_per_day' => (float)$this->admins_per_day,
            'daily_use'      => (float)$this->daily_use,
            'pack_size'      => (int)$this->pack_size,
            'packs_on_hand'  => (int)$this->packs_on_hand,
            'loose_units'    => (int)$this->loose_units,
            'opening_units'  => (int)$this->opening_units,
            'start_date' => optional($this->start_date)->toDateString(),
            'half_date'  => optional($this->half_date)->toDateString(),
            'runout_date'=> optional($this->runout_date)->toDateString(),
            'status'     => $this->status,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            'client'    => new ClientResource($this->whenLoaded('client')),
            'schedules' => ScheduleResource::collection($this->whenLoaded('schedules')),
        ];
    }
}
