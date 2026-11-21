<?php

namespace App\Modules\Notifier\Drivers;

use App\Modules\Notifier\Contracts\EnquiryNotifier;
use App\Modules\Notifier\DTO\EnquiryNotification;
use App\Modules\Notifier\Mail\EnquiryReceived;
use Illuminate\Support\Facades\Mail;

/**
 * Emails the sales inbox through Laravel's configured mailer, so switching
 * Mailpit -> SES/Postmark/SMTP is an .env change, not a code change.
 */
class MailNotifier implements EnquiryNotifier
{
    public function __construct(private readonly string $salesInbox) {}

    public function notify(EnquiryNotification $notification): void
    {
        Mail::to($this->salesInbox)->send(new EnquiryReceived($notification));
    }
}
