<?php

namespace App\Modules\Catalogue\Exceptions;

use App\Shared\Exceptions\DomainException;

class TopRatedLimitReached extends DomainException
{
    public static function withLimit(int $limit): self
    {
        return new self("You can feature at most {$limit} top rated products. Un-feature one first.");
    }

    public function errorCode(): string
    {
        return 'top_rated_limit_reached';
    }
}
