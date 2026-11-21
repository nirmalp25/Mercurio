<?php

namespace App\Modules\Catalogue\Http\Controllers;

use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Catalogue\Http\Requests\SearchRequest;
use App\Modules\Catalogue\Http\Resources\ProductResource;
use App\Modules\Catalogue\Http\Resources\SuggestionResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController
{
    public function __construct(private readonly ProductRepository $products) {}

    public function topRated(): AnonymousResourceCollection
    {
        return ProductResource::collection($this->products->topRated());
    }

    public function search(SearchRequest $request): AnonymousResourceCollection
    {
        return ProductResource::collection($this->products->search($request->term()));
    }

    public function suggest(SearchRequest $request): AnonymousResourceCollection
    {
        return SuggestionResource::collection(
            $this->products->suggest($request->term(), config('catalogue.suggest_limit')),
        );
    }

    public function show(int $id): ProductResource
    {
        return new ProductResource($this->products->find($id) ?? abort(404, 'Product not found.'));
    }
}
