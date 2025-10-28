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
        Schema::create('medication_courses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('client_id');

            $table->string('name');
            $table->string('strength')->nullable();
            $table->string('form')->nullable();

            $table->decimal('dose_per_admin', 10, 3);
            $table->decimal('admins_per_day', 10, 3);
            $table->decimal('daily_use', 10, 3); // cached

            $table->integer('pack_size');
            $table->integer('packs_on_hand');
            $table->integer('loose_units')->default(0);
            $table->integer('opening_units');

            $table->date('start_date');
            $table->date('half_date');
            $table->date('runout_date');

            $table->string('status')->default('active'); // active|complete|paused
            $table->timestampsTz();

            $table->foreign('client_id')->references('id')->on('clients')->cascadeOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medication_courses');
    }
};
