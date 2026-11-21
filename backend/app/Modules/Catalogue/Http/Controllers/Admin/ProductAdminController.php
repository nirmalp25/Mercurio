<?php

namespace App\Modules\Catalogue\Http\Controllers\Admin;

use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Catalogue\Http\Requests\SetTopRatedRequest;
use App\Modules\Catalogue\Http\Resources\ProductResource;
use App\Modules\Catalogue\Services\TopRatedService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductAdminController
{
    public function __construct(
        private readonly ProductRepository $products,
        private readonly TopRatedService $topRated,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return ProductResource::collection($this->products->all())
            ->additional(['meta' => [
                'maxTopRated' => config('catalogue.max_top_rated'),
                'topRatedCount' => $this->products->countTopRated(),
            ]]);
    }

    public function setTopRated(SetTopRatedRequest $request, int $id): ProductResource
    {
        $product = $this->products->find($id) ?? abort(404, 'Product not found.');

        return new ProductResource($this->topRated->setTopRated($product, $request->boolean('isTopRated')));
    }
}
