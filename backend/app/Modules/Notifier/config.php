<?php

use App\Modules\Notifier\Drivers\MailNotifier;
use App\Modules\Notifier\Drivers\NullNotifier;

return [
    // null = store only (admins read enquiries on the Queries page) | mail = also email the sales inbox
    'driver' => env('ENQUIRY_NOTIFIER', 'null'),

    // Add a new provider (Slack, CRM webhook, ...) by implementing EnquiryNotifier and registering it here.
    'drivers' => [
        'null' => NullNotifier::class,
        'mail' => MailNotifier::class,
    ],

    'mail' => [
        'to' => env('SALES_INBOX', 'sales@mercurio.test'),
    ],
];
