<?php

namespace App\Modules\Identity\Enums;

enum Role: string
{
    case Admin = 'admin';
    case Customer = 'customer';
}
