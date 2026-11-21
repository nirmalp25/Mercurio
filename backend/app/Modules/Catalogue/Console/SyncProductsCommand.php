<?php

namespace App\Modules\Catalogue\Console;

use App\Modules\Catalogue\Exceptions\ProductSourceUnavailable;
use App\Modules\Catalogue\Services\CatalogueSyncService;
use App\Modules\Catalogue\Sources\ProductSourceFactory;
use Illuminate\Console\Command;

class SyncProductsCommand extends Command
{
    protected $signature = 'catalogue:sync {--source= : Override CATALOGUE_SOURCE (fakestore|fixture)}';

    protected $description = 'Import products from the configured product source into the database';

    public function handle(ProductSourceFactory $sources, CatalogueSyncService $sync): int
    {
        $source = $sources->make($this->option('source'));

        try {
            $count = $sync->sync($source);
        } catch (ProductSourceUnavailable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }

        $this->info("Synced {$count} products from ".class_basename($source).'.');

        return self::SUCCESS;
    }
}
