<?php

namespace App\Modules\Catalogue\Http\Resources;

use App\Modules\Catalogue\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'price' => (float) $this->price,
            'description' => $this->description,
            'category' => [
                'name' => $this->category,
                'slug' => $this->category_slug,
            ],
            'image' => $this->image,
            'rating' => [
                'rate' => (float) $this->rating_rate,
                'count' => $this->rating_count,
            ],
            'isTopRated' => $this->is_top_rated,
        ];
    }
}
