<?php

namespace App\Modules\Catalogue\Http\Controllers;

use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Catalogue\Http\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryController
{
    public function __construct(private readonly ProductRepository $products) {}

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->products->categories()]);
    }

    /** Category view: featured products first, then every product in the category (top rated flagged). */
    public function products(string $slug): JsonResponse
    {
        $all = $this->products->byCategory($slug);
        abort_if($all->isEmpty(), 404, 'Category not found.');

        return response()->json([
            'data' => [
                'category' => ['slug' => $slug, 'name' => Str::title($all->first()->category)],
                'topRated' => ProductResource::collection($this->products->topRated($slug)),
                'products' => ProductResource::collection($all),
            ],
        ]);
    }
}
