<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('payee');
            $table->string('check');
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['Pending', 'Canceled', 'Approved', 'Rejected'])->default('Approved');
            $table->date('spent_at')->nullable();
            $table->string('remarks')->nullable();
            $table->string('documents')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
