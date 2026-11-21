<?php

namespace App\Modules\Catalogue\Sources;

use App\Modules\Catalogue\Contracts\ProductSource;
use App\Modules\Catalogue\Exceptions\ProductSourceUnavailable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class FakeStoreProductSource implements ProductSource
{
    use MapsFakeStorePayload;

    public function __construct(
        private readonly string $baseUrl,
        private readonly int $timeout,
    ) {}

    public function fetchAll(): array
    {
        try {
            $response = Http::baseUrl($this->baseUrl)
                ->acceptJson()
                ->timeout($this->timeout)
                ->retry(2, 500)
                ->get('/products')
                ->throw();
        } catch (ConnectionException|RequestException $e) {
            throw new ProductSourceUnavailable('Fake Store API unavailable: '.$e->getMessage(), previous: $e);
        }

        return $this->mapPayload($response->json());
    }
}
