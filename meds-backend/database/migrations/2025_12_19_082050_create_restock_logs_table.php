<?php
// database/migrations/xxxx_xx_xx_create_restock_logs_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('restock_logs', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->foreignId('course_id')->constrained('medication_courses')->cascadeOnDelete();
      $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();

      $table->string('action')->default('restock');
      $table->jsonb('before')->nullable();
      $table->jsonb('after')->nullable();
      $table->date('restock_date')->nullable();

      $table->timestamps();

      $table->index(['course_id', 'created_at']);
      $table->index(['client_id', 'created_at']);
      $table->index(['user_id', 'created_at']);
    });
  }

  public function down(): void {
    Schema::dropIfExists('restock_logs');
  }
};
