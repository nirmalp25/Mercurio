<?php

namespace App\Shared\Exceptions;

use RuntimeException;

/**
 * Base for expected business-rule failures. Rendered as JSON by bootstrap/app.php,
 * so modules never build HTTP error responses themselves.
 */
abstract class DomainException extends RuntimeException
{
    abstract public function errorCode(): string;

    public function status(): int
    {
        return 422;
    }
}
