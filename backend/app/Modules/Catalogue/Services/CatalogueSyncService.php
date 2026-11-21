<?php

namespace App\Modules\Catalogue\Services;

use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Catalogue\Contracts\ProductSource;
use App\Modules\Catalogue\Models\Product;
use Illuminate\Support\Facades\DB;

class CatalogueSyncService
{
    public function __construct(private readonly ProductRepository $products) {}

    /**
     * Pull every product from the source into our database. Idempotent: re-running
     * updates rows in place and never resets admin choices.
     *
     * @return int number of products synced
     */
    public function sync(ProductSource $source): int
    {
        $items = $source->fetchAll(); // fetch outside the transaction: no DB lock during network I/O

        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                $this->products->upsertFromSource($item);
            }
            $this->ensureDefaultTopRated();
        });

        return count($items);
    }

    /**
     * First-run bootstrap only: if no admin has featured anything yet, feature the
     * highest-rated products so the home page is never empty. Later syncs leave it alone.
     */
    private function ensureDefaultTopRated(): void
    {
        if ($this->products->countTopRated() > 0) {
            return;
        }

        Product::query()
            ->orderByDesc('rating_rate')
            ->orderByDesc('rating_count')
            ->limit(config('catalogue.max_top_rated'))
            ->pluck('id')
            ->pipe(fn ($ids) => Product::whereIn('id', $ids)->update([
                'is_top_rated' => true,
                'action_ts' => now(),
            ]));
    }
}
