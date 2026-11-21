<?php

namespace App\Modules\Catalogue\Contracts;

use App\Modules\Catalogue\DTO\ProductData;
use App\Modules\Catalogue\Models\Product;
use Illuminate\Support\Collection;

/**
 * How the application READS and WRITES catalogue data. Controllers and services
 * depend on this, never on Eloquent queries directly.
 */
interface ProductRepository
{
    /** @return Collection<int, Product> */
    public function topRated(?string $categorySlug = null): Collection;

    /** @return Collection<int, Product> */
    public function byCategory(string $categorySlug): Collection;

    /** @return Collection<int, array{slug: string, name: string, productCount: int, image: ?string}> */
    public function categories(): Collection;

    /** @return Collection<int, Product> */
    public function search(string $term): Collection;

    /** @return Collection<int, Product> */
    public function suggest(string $term, int $limit): Collection;

    public function find(int $id): ?Product;

    /** @return Collection<int, Product> */
    public function all(): Collection;

    public function countTopRated(): int;

    /** Insert or update by source id; must never touch admin-owned fields (is_top_rated). */
    public function upsertFromSource(ProductData $data): void;
}
