<?php

namespace App\Modules\Catalogue;

use App\Modules\Catalogue\Console\SyncProductsCommand;
use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Catalogue\Repositories\EloquentProductRepository;
use App\Shared\Providers\ModuleServiceProvider;

class CatalogueServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }

    protected function configKey(): ?string
    {
        return 'catalogue';
    }

    public function register(): void
    {
        parent::register();
        $this->app->bind(ProductRepository::class, EloquentProductRepository::class);
    }

    public function boot(): void
    {
        parent::boot();

        if ($this->app->runningInConsole()) {
            $this->commands([SyncProductsCommand::class]);
        }
    }
}
