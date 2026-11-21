<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Safety net: RefreshDatabase wipes the schema, so never let it touch a non-test DB.
        // (Caught in practice: Docker env vars were overriding phpunit.xml and tests hit the dev DB.)
        $database = DB::connection()->getDatabaseName();
        if (! str_ends_with((string) $database, '_test')) {
            throw new RuntimeException("Refusing to run tests against non-test database [{$database}].");
        }
    }
}
