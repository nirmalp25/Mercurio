<?php

namespace App\Modules\Notifier\Contracts;

use App\Modules\Notifier\DTO\EnquiryNotification;

/** Tells the sales team about a new enquiry. Implementations must not persist anything. */
interface EnquiryNotifier
{
    public function notify(EnquiryNotification $notification): void;
}
