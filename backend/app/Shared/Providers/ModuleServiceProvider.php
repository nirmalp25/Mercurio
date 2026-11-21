<?php

namespace App\Shared\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

/**
 * Convention for a module: it owns its config, migrations and API routes.
 * A concrete module provider only declares its name/path and its bindings.
 */
abstract class ModuleServiceProvider extends ServiceProvider
{
    /** Directory of the module, e.g. __DIR__ of the concrete provider. */
    abstract protected function modulePath(): string;

    /** Config key the module's config.php is merged under (null = no config). */
    protected function configKey(): ?string
    {
        return null;
    }

    public function register(): void
    {
        $config = $this->modulePath().'/config.php';
        if ($this->configKey() && file_exists($config)) {
            $this->mergeConfigFrom($config, $this->configKey());
        }
    }

    public function boot(): void
    {
        $migrations = $this->modulePath().'/Database/migrations';
        if (is_dir($migrations)) {
            $this->loadMigrationsFrom($migrations);
        }

        $routes = $this->modulePath().'/routes.php';
        if (file_exists($routes)) {
            Route::prefix('api')->middleware('api')->group($routes);
        }
    }
}
