<?php

namespace App\Modules\Notifier\Drivers;

use App\Modules\Notifier\Contracts\EnquiryNotifier;
use App\Modules\Notifier\DTO\EnquiryNotification;

/** No provider configured: the stored enquiry on the admin Queries page is the inbox. */
class NullNotifier implements EnquiryNotifier
{
    public function notify(EnquiryNotification $notification): void
    {
        // Intentionally does nothing.
    }
}
