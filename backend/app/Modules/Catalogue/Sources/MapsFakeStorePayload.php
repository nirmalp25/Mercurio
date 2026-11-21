<?php

namespace App\Modules\Catalogue\Sources;

use App\Modules\Catalogue\DTO\ProductData;
use App\Modules\Catalogue\Exceptions\ProductSourceUnavailable;

/** Shared mapping for the Fake Store payload shape (used by the live API and the fixture). */
trait MapsFakeStorePayload
{
    /**
     * @param  mixed  $payload
     * @return list<ProductData>
     */
    protected function mapPayload($payload): array
    {
        if (! is_array($payload)) {
            throw new ProductSourceUnavailable('Product source returned an unexpected payload.');
        }

        return array_values(array_map(function ($item): ProductData {
            if (! isset($item['id'], $item['title'], $item['price'], $item['category'])) {
                throw new ProductSourceUnavailable('Product source returned an item missing required fields.');
            }

            return new ProductData(
                sourceId: (int) $item['id'],
                title: (string) $item['title'],
                price: (float) $item['price'],
                description: (string) ($item['description'] ?? ''),
                category: (string) $item['category'],
                image: isset($item['image']) ? (string) $item['image'] : null,
                ratingRate: (float) ($item['rating']['rate'] ?? 0),
                ratingCount: (int) ($item['rating']['count'] ?? 0),
            );
        }, $payload));
    }
}
