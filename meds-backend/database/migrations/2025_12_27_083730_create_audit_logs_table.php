<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('action'); // e.g. alert.acknowledged
            $table->string('entity_type'); // e.g. MedicationCourse
            $table->unsignedBigInteger('entity_id');

            $table->jsonb('metadata')->nullable(); // old/new/note etc.
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestampsTz();

            $table->index(['entity_type', 'entity_id']);
            $table->index(['actor_user_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
