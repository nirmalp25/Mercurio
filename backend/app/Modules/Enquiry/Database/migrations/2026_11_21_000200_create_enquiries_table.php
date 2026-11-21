<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            // nullOnDelete: an enquiry is a sales record and must outlive the product it was about
            // (e.g. a product dropped by a future data source). product_title keeps it readable.
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->string('product_title');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email');
            $table->char('country_code', 2);
            $table->string('phone', 20); // E.164, e.g. +919876543210
            $table->text('query');
            $table->string('status', 10)->default('new')->index();
            $table->timestamp('enquired_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};
