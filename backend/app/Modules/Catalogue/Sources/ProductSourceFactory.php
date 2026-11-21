<?php

namespace App\Modules\Catalogue\Sources;

use App\Modules\Catalogue\Contracts\ProductSource;
use InvalidArgumentException;

/** Resolves a ProductSource by its config name ("fakestore", "fixture", ...). */
class ProductSourceFactory
{
    public function make(?string $name = null): ProductSource
    {
        $name ??= config('catalogue.source');

        return match ($name) {
            'fakestore' => new FakeStoreProductSource(
                config('catalogue.fakestore.base_url'),
                config('catalogue.fakestore.timeout'),
            ),
            'fixture' => new FixtureProductSource(config('catalogue.fixture_path')),
            default => throw new InvalidArgumentException("Unknown catalogue source [{$name}]."),
        };
    }
}
