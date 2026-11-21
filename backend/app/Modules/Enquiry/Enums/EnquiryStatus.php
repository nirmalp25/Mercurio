<?php

namespace App\Modules\Enquiry\Enums;

enum EnquiryStatus: string
{
    case New = 'new';
    case Read = 'read';
}
