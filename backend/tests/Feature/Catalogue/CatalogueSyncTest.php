<?php

use App\Modules\Catalogue\Models\Product;
use App\Modules\Catalogue\Sources\FakeStoreProductSource;
use App\Modules\Catalogue\Exceptions\ProductSourceUnavailable;
use Illuminate\Support\Facades\Http;

it('imports every product from the fixture source', function () {
    $this->artisan('catalogue:sync', ['--source' => 'fixture'])->assertSuccessful();

    expect(Product::count())->toBe(20)
        ->and(Product::where('category_slug', 'mens-clothing')->exists())->toBeTrue();
});

it('features the highest rated products on first sync, capped by config', function () {
    $this->artisan('catalogue:sync', ['--source' => 'fixture']);

    expect(Product::where('is_top_rated', true)->count())->toBe(config('catalogue.max_top_rated'));
});

it('is idempotent and never overwrites admin top-rated choices', function () {
    $this->artisan('catalogue:sync', ['--source' => 'fixture']);

    // Admin re-curates: only one specific product is featured.
    Product::query()->update(['is_top_rated' => false]);
    $chosen = Product::orderBy('rating_rate')->first();
    $chosen->update(['is_top_rated' => true]);

    $this->artisan('catalogue:sync', ['--source' => 'fixture']);

    expect(Product::count())->toBe(20)
        ->and(Product::where('is_top_rated', true)->pluck('id')->all())->toBe([$chosen->id]);
});

it('maps the Fake Store payload into source-agnostic products', function () {
    Http::fake(['fakestore.test/products' => Http::response([[
        'id' => 7, 'title' => 'Ring', 'price' => 9.99, 'description' => 'Shiny',
        'category' => 'jewelery', 'image' => 'https://img/7.png', 'rating' => ['rate' => 4.6, 'count' => 12],
    ]])]);

    $items = (new FakeStoreProductSource('https://fakestore.test', 2))->fetchAll();

    expect($items)->toHaveCount(1)
        ->and($items[0]->sourceId)->toBe(7)
        ->and($items[0]->ratingRate)->toBe(4.6);
});

it('raises a domain exception when Fake Store is down', function () {
    Http::fake(['fakestore.test/*' => Http::response(status: 503)]);

    (new FakeStoreProductSource('https://fakestore.test', 2))->fetchAll();
})->throws(ProductSourceUnavailable::class);

it('fails the sync command gracefully when the source is unavailable', function () {
    config(['catalogue.fakestore.base_url' => 'https://fakestore.test']);
    Http::fake(['fakestore.test/*' => Http::response(status: 500)]);

    $this->artisan('catalogue:sync', ['--source' => 'fakestore'])->assertFailed();
    expect(Product::count())->toBe(0);
});
