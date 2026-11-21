<?php

namespace App\Modules\Catalogue\Database\Factories;

use App\Modules\Catalogue\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $category = fake()->randomElement(['electronics', 'jewelery', "men's clothing", "women's clothing"]);

        return [
            'source_id' => fake()->unique()->numberBetween(1, 1_000_000),
            'title' => fake()->unique()->words(3, true),
            'price' => fake()->randomFloat(2, 1, 999),
            'description' => fake()->sentence(12),
            'category' => $category,
            'category_slug' => Str::slug($category),
            'image' => fake()->imageUrl(),
            'rating_rate' => fake()->randomFloat(1, 1, 5),
            'rating_count' => fake()->numberBetween(0, 500),
            'is_top_rated' => false,
            'action_ts' => now(),
        ];
    }

    public function topRated(): static
    {
        return $this->state(['is_top_rated' => true]);
    }

    public function inCategory(string $category): static
    {
        return $this->state(['category' => $category, 'category_slug' => Str::slug($category)]);
    }
}
