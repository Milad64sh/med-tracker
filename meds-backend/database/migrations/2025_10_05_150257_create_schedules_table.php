<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            $table->string('type'); // half | runout
            $table->timestampTz('fire_at');
            $table->timestampTz('sent_at')->nullable();
            $table->string('external_id')->nullable(); // for eventBridge
            $table->timestampsTz();

            $table->foreign('course_id')->references('id')->on('medication_courses')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
