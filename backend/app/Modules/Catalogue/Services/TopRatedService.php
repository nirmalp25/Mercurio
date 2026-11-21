<?php

namespace App\Modules\Catalogue\Services;

use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Catalogue\Exceptions\TopRatedLimitReached;
use App\Modules\Catalogue\Models\Product;
use Illuminate\Support\Facades\DB;

class TopRatedService
{
    public function __construct(private readonly ProductRepository $products) {}

    /**
     * Feature or un-feature a product on the home page.
     *
     * @throws TopRatedLimitReached when featuring would exceed catalogue.max_top_rated
     */
    public function setTopRated(Product $product, bool $isTopRated): Product
    {
        return DB::transaction(function () use ($product, $isTopRated) {
            $limit = (int) config('catalogue.max_top_rated');

            // TODO(human): enforce the top-rated cap before saving.

            $product->forceFill([
                'is_top_rated' => $isTopRated,
                'action_ts' => now(),
            ])->save();

            return $product;
        });
    }
}
