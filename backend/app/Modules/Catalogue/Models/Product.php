<?php

namespace App\Modules\Catalogue\Models;

use App\Modules\Catalogue\Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $source_id
 * @property string $title
 * @property string $price
 * @property string $description
 * @property string $category
 * @property string $category_slug
 * @property ?string $image
 * @property string $rating_rate
 * @property int $rating_count
 * @property bool $is_top_rated
 * @property ?\Illuminate\Support\Carbon $action_ts
 */
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'rating_rate' => 'decimal:1',
            'rating_count' => 'integer',
            'is_top_rated' => 'boolean',
            'action_ts' => 'datetime',
        ];
    }

    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }
}
