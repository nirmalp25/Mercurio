<?php

use App\Modules\Catalogue\Models\Product;

describe('home page', function () {
    it('returns exactly the products chosen as top rated', function () {
        $featured = Product::factory()->count(5)->topRated()->create();
        Product::factory()->count(3)->create();

        $this->getJson('/api/products/top-rated')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.isTopRated', true);

        expect(collect($this->getJson('/api/products/top-rated')->json('data'))->pluck('id')->sort()->values()->all())
            ->toBe($featured->pluck('id')->sort()->values()->all());
    });
});

describe('categories', function () {
    it('lists categories with counts', function () {
        Product::factory()->count(2)->inCategory('electronics')->create();
        Product::factory()->inCategory('jewelery')->create();

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['slug' => 'electronics', 'productCount' => 2]);
    });

    it('returns top rated and all products for a category', function () {
        $star = Product::factory()->inCategory('electronics')->topRated()->create();
        Product::factory()->count(2)->inCategory('electronics')->create();
        Product::factory()->inCategory('jewelery')->topRated()->create();

        $this->getJson('/api/categories/electronics/products')
            ->assertOk()
            ->assertJsonCount(1, 'data.topRated')
            ->assertJsonPath('data.topRated.0.id', $star->id)
            ->assertJsonCount(3, 'data.products'); // includes the top rated one, flagged
    });

    it('404s for an unknown category', function () {
        $this->getJson('/api/categories/nope/products')->assertNotFound();
    });
});

describe('search', function () {
    beforeEach(function () {
        Product::factory()->create(['title' => 'Slim Fit Jacket', 'description' => 'Cotton']);
        Product::factory()->create(['title' => 'Gold Ring', 'description' => 'Pairs with any jacket']);
        Product::factory()->create(['title' => 'SSD Drive', 'description' => 'Fast storage']);
    });

    it('only returns products whose text matches, case-insensitively, title hits first', function () {
        $titles = collect($this->getJson('/api/products/search?q=JACKET')->assertOk()->json('data'))->pluck('title');

        expect($titles->all())->toBe(['Slim Fit Jacket', 'Gold Ring']);
    });

    it('treats LIKE wildcards literally', function () {
        $this->getJson('/api/products/search?q=%25')->assertOk()->assertJsonCount(0, 'data');
    });

    it('requires a search term', function () {
        $this->getJson('/api/products/search?q=')->assertUnprocessable();
    });

    it('suggests titles for autocomplete with a lightweight payload', function () {
        $this->getJson('/api/products/suggest?q=sl')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Slim Fit Jacket')
            ->assertJsonMissingPath('data.0.description');
    });

    it('needs at least two characters to suggest', function () {
        $this->getJson('/api/products/suggest?q=s')->assertUnprocessable();
    });
});

describe('product details', function () {
    it('shows a product', function () {
        $product = Product::factory()->create();

        $this->getJson("/api/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.title', $product->title)
            ->assertJsonStructure(['data' => ['id', 'title', 'price', 'description', 'category' => ['name', 'slug'], 'image', 'rating', 'isTopRated']]);
    });

    it('404s for a missing product', function () {
        $this->getJson('/api/products/999999')->assertNotFound();
    });
});
