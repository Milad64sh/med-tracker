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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('course_id');
            $table->string('channel'); // sms|email (stub for now)
            $table->string('to_address');
            $table->json('payload');
            $table->timestampTz('sent_at')->nullable();
            $table->string('status')->default('queued'); // queued|sent|failed
            $table->text('error')->nullable();
            $table->timestampsTz();

            $table->foreign('course_id')->references('id')->on('medication_courses')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
