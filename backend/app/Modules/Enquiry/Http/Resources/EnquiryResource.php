<?php

namespace App\Modules\Enquiry\Http\Resources;

use App\Modules\Enquiry\Models\Enquiry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** Admin view of an enquiry. @mixin Enquiry */
class EnquiryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => ['id' => $this->product_id, 'title' => $this->product_title],
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'email' => $this->email,
            'countryCode' => $this->country_code,
            'phone' => $this->phone,
            'query' => $this->query,
            'status' => $this->status->value,
            'enquiredAt' => $this->enquired_at->toIso8601String(),
        ];
    }
}
