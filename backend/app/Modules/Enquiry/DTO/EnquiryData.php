<?php

namespace App\Modules\Enquiry\DTO;

/** Validated, normalised enquiry input (phone already in E.164). */
final readonly class EnquiryData
{
    public function __construct(
        public int $productId,
        public string $firstName,
        public string $lastName,
        public string $email,
        public string $countryCode,
        public string $phone,
        public string $query,
    ) {}
}
