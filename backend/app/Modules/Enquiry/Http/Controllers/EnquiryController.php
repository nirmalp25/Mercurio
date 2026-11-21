<?php

namespace App\Modules\Enquiry\Http\Controllers;

use App\Modules\Enquiry\Http\Requests\StoreEnquiryRequest;
use App\Modules\Enquiry\Services\EnquiryService;
use Illuminate\Http\JsonResponse;

class EnquiryController
{
    public function __construct(private readonly EnquiryService $enquiries) {}

    public function store(StoreEnquiryRequest $request): JsonResponse
    {
        $enquiry = $this->enquiries->submit($request->toData());

        // Deliberately minimal: the public endpoint never echoes personal data back.
        return response()->json([
            'message' => 'Thank you',
            'data' => [
                'id' => $enquiry->id,
                'enquiredAt' => $enquiry->enquired_at->toIso8601String(),
            ],
        ], 201);
    }
}
