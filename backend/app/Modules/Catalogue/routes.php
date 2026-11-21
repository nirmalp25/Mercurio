<?php

use App\Modules\Catalogue\Http\Controllers\Admin\ProductAdminController;
use App\Modules\Catalogue\Http\Controllers\CategoryController;
use App\Modules\Catalogue\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

// Public catalogue (prefixed with /api by ModuleServiceProvider)
Route::middleware('throttle:120,1')->group(function () {
    Route::get('products/top-rated', [ProductController::class, 'topRated'])->name('products.top-rated');
    Route::get('products/search', [ProductController::class, 'search'])->name('products.search');
    Route::get('products/suggest', [ProductController::class, 'suggest'])->name('products.suggest');
    Route::get('products/{id}', [ProductController::class, 'show'])->whereNumber('id')->name('products.show');

    Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('categories/{slug}/products', [CategoryController::class, 'products'])
        ->where('slug', '[a-z0-9-]+')
        ->name('categories.products');
});

// Admin
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('products', [ProductAdminController::class, 'index'])->name('admin.products.index');
    Route::patch('products/{id}/top-rated', [ProductAdminController::class, 'setTopRated'])
        ->whereNumber('id')
        ->name('admin.products.top-rated');
});
