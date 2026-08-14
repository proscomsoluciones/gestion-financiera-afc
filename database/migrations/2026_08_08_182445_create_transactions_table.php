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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('folio_number')->unique();
            $table->enum('type', ['income', 'expense'])->default('income');
            $table->enum('category', ['tributo', 'pase', 'apelacion', 'multa', 'otro_ingreso', 'egreso'])->default('otro_ingreso');
            $table->foreignId('club_id')->nullable()->constrained('clubs')->onDelete('set null');
            $table->decimal('amount', 12, 2);
            $table->json('breakdown')->nullable();
            $table->string('concept');
            $table->string('period_month')->nullable();
            $table->string('player_name')->nullable();
            $table->string('payment_method')->default('efectivo');
            $table->string('reference_number')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->date('date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
