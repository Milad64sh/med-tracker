<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id(); // bigint primary key
            $table->foreignId('course_id')
                  ->constrained('medication_courses')
                  ->cascadeOnDelete();

            $table->string('type'); // half | runout
            $table->timestampTz('fire_at');
            $table->timestampTz('sent_at')->nullable();
            $table->string('external_id')->nullable(); // for eventBridge
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
