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

            // Only turning a product ON can exceed the cap; re-featuring or un-featuring never does.
            // Lock the featured rows so two concurrent admins can't both pass the check.
            if ($isTopRated && ! $product->is_top_rated) {
                // Postgres forbids FOR UPDATE with aggregates, so lock the rows and count in PHP.
                $featured = Product::where('is_top_rated', true)->lockForUpdate()->pluck('id')->count();
                if ($featured >= $limit) {
                    throw TopRatedLimitReached::withLimit($limit);
                }
            }

            $product->forceFill([
                'is_top_rated' => $isTopRated,
                'action_ts' => now(),
            ])->save();

            return $product;
        });
    }
}
