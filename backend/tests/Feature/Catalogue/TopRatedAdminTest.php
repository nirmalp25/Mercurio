<?php

use App\Modules\Catalogue\Models\Product;

it('blocks guests and non-admins from admin endpoints', function () {
    $product = Product::factory()->create();

    $this->getJson('/api/admin/products')->assertUnauthorized();
    $this->actingAs(customer())->getJson('/api/admin/products')->assertForbidden();
    $this->actingAs(customer())
        ->patchJson("/api/admin/products/{$product->id}/top-rated", ['isTopRated' => true])
        ->assertForbidden();
});

it('lets an admin feature a product', function () {
    $product = Product::factory()->create();

    $this->actingAs(admin())
        ->patchJson("/api/admin/products/{$product->id}/top-rated", ['isTopRated' => true])
        ->assertOk()
        ->assertJsonPath('data.isTopRated', true);

    expect($product->fresh()->is_top_rated)->toBeTrue();
});

it('rejects featuring beyond the configured cap', function () {
    Product::factory()->count(5)->topRated()->create();
    $sixth = Product::factory()->create();

    $this->actingAs(admin())
        ->patchJson("/api/admin/products/{$sixth->id}/top-rated", ['isTopRated' => true])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'top_rated_limit_reached');

    expect($sixth->fresh()->is_top_rated)->toBeFalse();
});

it('always allows un-featuring, even at the cap', function () {
    $featured = Product::factory()->count(5)->topRated()->create();

    $this->actingAs(admin())
        ->patchJson("/api/admin/products/{$featured[0]->id}/top-rated", ['isTopRated' => false])
        ->assertOk();
});

it('is a no-op to re-feature an already featured product at the cap', function () {
    $featured = Product::factory()->count(5)->topRated()->create();

    $this->actingAs(admin())
        ->patchJson("/api/admin/products/{$featured[0]->id}/top-rated", ['isTopRated' => true])
        ->assertOk();
});

it('validates the payload', function () {
    $product = Product::factory()->create();

    $this->actingAs(admin())
        ->patchJson("/api/admin/products/{$product->id}/top-rated", ['isTopRated' => 'maybe'])
        ->assertUnprocessable();
});
