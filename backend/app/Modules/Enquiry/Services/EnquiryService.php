<?php

namespace App\Modules\Enquiry\Services;

use App\Modules\Catalogue\Contracts\ProductRepository;
use App\Modules\Enquiry\DTO\EnquiryData;
use App\Modules\Enquiry\Enums\EnquiryStatus;
use App\Modules\Enquiry\Events\EnquirySubmitted;
use App\Modules\Enquiry\Models\Enquiry;
use Illuminate\Support\Facades\DB;

class EnquiryService
{
    // Cross-module access goes through Catalogue's public contract, not its model/table.
    public function __construct(private readonly ProductRepository $products) {}

    /** Persist first, notify second: storing the enquiry is the source of truth. */
    public function submit(EnquiryData $data): Enquiry
    {
        return DB::transaction(function () use ($data) {
            $product = $this->products->find($data->productId);

            $enquiry = Enquiry::create([
                'product_id' => $data->productId,
                'product_title' => $product?->title ?? 'Unknown product',
                'first_name' => $data->firstName,
                'last_name' => $data->lastName,
                'email' => $data->email,
                'country_code' => $data->countryCode,
                'phone' => $data->phone,
                'query' => $data->query,
                'status' => EnquiryStatus::New,
                'enquired_at' => now(),
            ]);

            EnquirySubmitted::dispatch($enquiry); // delivered after commit

            return $enquiry;
        });
    }

    public function setStatus(Enquiry $enquiry, EnquiryStatus $status): Enquiry
    {
        $enquiry->update(['status' => $status]);

        return $enquiry;
    }
}
