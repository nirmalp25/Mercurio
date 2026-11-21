<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            // Upstream identifier, decoupled from our PK so a new source can't collide with it.
            $table->unsignedBigInteger('source_id')->unique();
            $table->string('title');
            $table->decimal('price', 10, 2);
            $table->text('description');
            $table->string('category')->index();
            $table->string('category_slug')->index();
            $table->string('image', 2048)->nullable();
            $table->decimal('rating_rate', 3, 1)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->boolean('is_top_rated')->default(false)->index();
            // Last time this row was changed by a sync or an admin action.
            $table->timestamp('action_ts')->nullable();
            $table->timestamps();
        });

        // Trigram index keeps ILIKE '%term%' search fast as the catalogue grows.
        DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        DB::statement('CREATE INDEX products_title_trgm_idx ON products USING gin (title gin_trgm_ops)');
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
