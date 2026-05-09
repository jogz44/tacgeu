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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            // Personal Information
            $table->string('image', 255)->nullable();
            $table->string('last_name');
            $table->string('given_name');
            $table->string('middle_name')->nullable();
            $table->string('suffix')->nullable();
            $table->string('nickname')->nullable();
            $table->string('contact_number');
            $table->string('email')->unique();
            $table->text('house_address')->nullable();
            $table->text('region')->nullable();
            $table->text('province')->nullable();
            $table->text('city')->nullable();
            $table->text('barangay')->nullable();
            // Demographics
            $table->enum('sex', ['Male', 'Female']);
            $table->string('birthdate');
            $table->string('birthplace')->nullable();
            $table->enum('civil_status', ['Single', 'Married', 'Widow/Widower', 'Separated']);
            $table->string('spouse_name')->nullable();
            $table->string('religion')->nullable();
            // Education
            $table->string('education');
            $table->string('college_degree')->nullable();
            $table->string('postgrad_degree')->nullable();
            // Employment Information
            $table->string('position')->nullable();
            $table->string('salary_grade')->nullable();
            $table->string('office')->nullable();
            // Membership Info
            $table->boolean('physically_challenged')->default(false);
            $table->boolean('solo_parent')->default(false);
            $table->boolean('adoptive_couple')->default(false);
            $table->boolean('agreement')->default(false);
            $table->string('status')->default('Pending');
            $table->string('password');
            $table->string('role')->default('Visitor');
            $table->string('membership_status')->default('Pending');
            $table->string('remarks')->nullable();
            $table->string('affiliation')->nullable();
            $table->boolean('is_first_log')->default(true);
            $table->timestamp('email_verified_at')->nullable();
            $table->string('documents')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
