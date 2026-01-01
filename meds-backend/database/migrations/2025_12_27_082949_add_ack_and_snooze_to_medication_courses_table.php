<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('medication_courses', function (Blueprint $table) {
            // Acknowledge
            $table->timestampTz('acknowledged_at')->nullable()->after('status');
            $table->foreignId('acknowledged_by')
                ->nullable()
                ->after('acknowledged_at')
                ->constrained('users')
                ->nullOnDelete();
            $table->text('ack_note')->nullable()->after('acknowledged_by');

            // Snooze
            $table->timestampTz('snoozed_until')->nullable()->after('ack_note');
            $table->foreignId('snoozed_by')
                ->nullable()
                ->after('snoozed_until')
                ->constrained('users')
                ->nullOnDelete();
            $table->text('snooze_note')->nullable()->after('snoozed_by');
        });
    }

    public function down(): void
    {
        Schema::table('medication_courses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('acknowledged_by');
            $table->dropColumn(['acknowledged_at', 'ack_note']);

            $table->dropConstrainedForeignId('snoozed_by');
            $table->dropColumn(['snoozed_until', 'snooze_note']);
        });
    }
};
