<?php

namespace App\Modules\Catalogue\Repositories;

use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Catalogue\DTO\ProductData;
use App\Modules\Catalogue\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EloquentProductRepository implements ProductRepository
{
    public function topRated(?string $categorySlug = null): Collection
    {
        return Product::query()
            ->where('is_top_rated', true)
            ->when($categorySlug, fn (Builder $q) => $q->where('category_slug', $categorySlug))
            ->orderByDesc('rating_rate')
            ->get();
    }

    public function byCategory(string $categorySlug): Collection
    {
        return Product::query()
            ->where('category_slug', $categorySlug)
            ->orderByDesc('is_top_rated')
            ->orderBy('title')
            ->get();
    }

    public function categories(): Collection
    {
        // One representative image per category (the best-rated product) for the category card.
        return Product::query()
            ->select('category', 'category_slug', DB::raw('COUNT(*) as product_count'))
            ->selectRaw('(ARRAY_AGG(image ORDER BY rating_rate DESC))[1] as image')
            ->groupBy('category', 'category_slug')
            ->orderBy('category')
            ->get()
            ->map(fn ($row) => [
                'slug' => $row->category_slug,
                'name' => Str::title($row->category),
                'productCount' => (int) $row->product_count,
                'image' => $row->image,
            ]);
    }

    public function search(string $term): Collection
    {
        $like = '%'.$this->escapeLike($term).'%';

        return Product::query()
            ->where(fn (Builder $q) => $q
                ->where('title', 'ILIKE', $like)
                ->orWhere('description', 'ILIKE', $like)
                ->orWhere('category', 'ILIKE', $like))
            // Title hits are the most relevant, so rank them first.
            ->orderByRaw('CASE WHEN title ILIKE ? THEN 0 ELSE 1 END', [$like])
            ->orderBy('title')
            ->get();
    }

    public function suggest(string $term, int $limit): Collection
    {
        $escaped = $this->escapeLike($term);

        return Product::query()
            ->select('id', 'title', 'category')
            ->where('title', 'ILIKE', '%'.$escaped.'%')
            // Prefix matches feel most natural in autocomplete.
            ->orderByRaw('CASE WHEN title ILIKE ? THEN 0 ELSE 1 END', [$escaped.'%'])
            ->orderBy('title')
            ->limit($limit)
            ->get();
    }

    public function find(int $id): ?Product
    {
        return Product::find($id);
    }

    public function all(): Collection
    {
        return Product::query()->orderBy('category')->orderBy('title')->get();
    }

    public function countTopRated(): int
    {
        return Product::where('is_top_rated', true)->count();
    }

    public function upsertFromSource(ProductData $data): void
    {
        Product::updateOrCreate(
            ['source_id' => $data->sourceId],
            [
                'title' => $data->title,
                'price' => $data->price,
                'description' => $data->description,
                'category' => $data->category,
                'category_slug' => Str::slug($data->category),
                'image' => $data->image,
                'rating_rate' => $data->ratingRate,
                'rating_count' => $data->ratingCount,
                'action_ts' => now(),
                // is_top_rated intentionally omitted: it is owned by admins, not the source.
            ],
        );
    }

    /** Treat user input literally: % and _ are wildcards in LIKE. */
    private function escapeLike(string $value): string
    {
        return addcslashes($value, '%_\\');
    }
}
