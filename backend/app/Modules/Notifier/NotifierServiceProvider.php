<?php

namespace App\Modules\Notifier;

use App\Modules\Notifier\Contracts\EnquiryNotifier;
use App\Shared\Providers\ModuleServiceProvider;

class NotifierServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }

    protected function configKey(): ?string
    {
        return 'notifier';
    }

    public function register(): void
    {
        parent::register();
        $this->app->bind(EnquiryNotifier::class, fn ($app) => $app->make(NotifierFactory::class)->make());
    }
}
