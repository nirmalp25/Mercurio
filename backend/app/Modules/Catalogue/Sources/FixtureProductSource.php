<?php

namespace App\Modules\Catalogue\Sources;

use App\Modules\Catalogue\Contracts\ProductSource;
use App\Modules\Catalogue\Exceptions\ProductSourceUnavailable;

/** Bundled snapshot of Fake Store data: offline fallback and deterministic test data. */
class FixtureProductSource implements ProductSource
{
    use MapsFakeStorePayload;

    public function __construct(private readonly string $path) {}

    public function fetchAll(): array
    {
        if (! is_readable($this->path)) {
            throw new ProductSourceUnavailable("Fixture not found at {$this->path}.");
        }

        return $this->mapPayload(json_decode((string) file_get_contents($this->path), true));
    }
}
