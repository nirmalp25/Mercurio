<?php

return [
    // Which upstream feeds `catalogue:sync` (resolved by Sources\ProductSourceFactory).
    'source' => env('CATALOGUE_SOURCE', 'fakestore'),

    'fakestore' => [
        'base_url' => env('FAKESTORE_BASE_URL', 'https://fakestoreapi.com'),
        'timeout' => (int) env('FAKESTORE_TIMEOUT', 10),
    ],

    'fixture_path' => __DIR__.'/Database/fixtures/products.json',

    // Business rule: how many products may be featured as "top rated" at once.
    'max_top_rated' => (int) env('MAX_TOP_RATED', 5),

    'suggest_limit' => 8,
];
