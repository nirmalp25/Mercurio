<?php

namespace App\Modules\Catalogue\Exceptions;

use RuntimeException;

/** The upstream product source could not be reached or returned invalid data. */
class ProductSourceUnavailable extends RuntimeException {}
