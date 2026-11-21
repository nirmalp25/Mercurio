<?php

namespace App\Modules\Catalogue\Contracts;

use App\Modules\Catalogue\DTO\ProductData;
use App\Modules\Catalogue\Exceptions\ProductSourceUnavailable;

/**
 * Where product data comes FROM (Fake Store today; a PIM, Shopify or CSV tomorrow).
 * Only the sync process talks to a source; the API always reads from our database.
 */
interface ProductSource
{
    /**
     * @return list<ProductData>
     *
     * @throws ProductSourceUnavailable
     */
    public function fetchAll(): array;
}
