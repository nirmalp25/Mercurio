<?php

use App\Modules\Catalogue\CatalogueServiceProvider;
use App\Modules\Enquiry\EnquiryServiceProvider;
use App\Modules\Identity\IdentityServiceProvider;
use App\Modules\Notifier\NotifierServiceProvider;
use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,

    // Modules — each owns its config, migrations, routes and bindings.
    IdentityServiceProvider::class,
    CatalogueServiceProvider::class,
    NotifierServiceProvider::class,
    EnquiryServiceProvider::class,
];
