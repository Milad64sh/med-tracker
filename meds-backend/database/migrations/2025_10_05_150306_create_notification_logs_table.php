<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id(); // bigint PK
            $table->foreignId('course_id')
                  ->constrained('medication_courses')
                  ->cascadeOnDelete();

            $table->string('channel'); // sms | email (stub for now)
            $table->string('to_address');
            $table->json('payload');
            $table->timestampTz('sent_at')->nullable();
            $table->string('status')->default('queued'); // queued | sent | failed
            $table->text('error')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
