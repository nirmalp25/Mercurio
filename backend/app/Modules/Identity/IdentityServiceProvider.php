<?php

namespace App\Modules\Identity;

use App\Shared\Providers\ModuleServiceProvider;

class IdentityServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }

    protected function configKey(): ?string
    {
        return 'identity';
    }
}
