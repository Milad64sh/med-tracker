<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach(['45 Culver Lane', '16 Allcroft', '171 Wokingham rd', '65 Hilltop'] as $name){
            Service::firstOrCreate(['name' => $name]);
        }
    }
}
