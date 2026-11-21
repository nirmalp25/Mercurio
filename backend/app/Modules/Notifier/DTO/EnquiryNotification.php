<?php

namespace App\Modules\Notifier\DTO;

use DateTimeInterface;

/** Plain data the notifier needs. Keeps the Notifier module independent of the Enquiry model. */
final readonly class EnquiryNotification
{
    public function __construct(
        public string $name,
        public string $email,
        public string $phone,
        public string $productTitle,
        public string $query,
        public DateTimeInterface $enquiredAt,
    ) {}
}
