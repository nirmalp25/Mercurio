<?php

namespace App\Modules\Catalogue\DTO;

/**
 * Source-agnostic product shape. Every ProductSource adapter maps its upstream
 * payload into this, so nothing downstream knows where products came from.
 */
final readonly class ProductData
{
    public function __construct(
        public int $sourceId,
        public string $title,
        public float $price,
        public string $description,
        public string $category,
        public ?string $image,
        public float $ratingRate,
        public int $ratingCount,
    ) {}
}
