<?php

namespace App\Modules\Enquiry;

use App\Modules\Enquiry\Events\EnquirySubmitted;
use App\Modules\Enquiry\Listeners\SendEnquiryNotification;
use App\Shared\Providers\ModuleServiceProvider;
use Illuminate\Support\Facades\Event;

class EnquiryServiceProvider extends ModuleServiceProvider
{
    protected function modulePath(): string
    {
        return __DIR__;
    }

    public function boot(): void
    {
        parent::boot();
        Event::listen(EnquirySubmitted::class, SendEnquiryNotification::class);
    }
}
