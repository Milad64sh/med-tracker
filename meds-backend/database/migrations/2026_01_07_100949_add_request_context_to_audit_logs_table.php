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
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('http_method', 10)->nullable()->after('user_agent');
            $table->text('path')->nullable()->after('http_method');      // /api/alerts/123/snooze
            $table->text('full_url')->nullable()->after('path');      
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            //
        });
    }
};
