<?php

namespace App\Modules\Enquiry\Http\Controllers\Admin;

use App\Modules\Enquiry\Enums\EnquiryStatus;
use App\Modules\Enquiry\Http\Requests\UpdateEnquiryStatusRequest;
use App\Modules\Enquiry\Http\Resources\EnquiryResource;
use App\Modules\Enquiry\Models\Enquiry;
use App\Modules\Enquiry\Services\EnquiryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class EnquiryAdminController
{
    public function __construct(private readonly EnquiryService $enquiries) {}

    /** The admin "Queries" page: newest first, optionally only unread. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate(['status' => ['nullable', Rule::enum(EnquiryStatus::class)]]);

        $page = Enquiry::query()
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->orderByDesc('enquired_at')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return EnquiryResource::collection($page)->additional(['meta' => [
            'unreadCount' => Enquiry::where('status', EnquiryStatus::New)->count(),
        ]]);
    }

    public function update(UpdateEnquiryStatusRequest $request, int $id): EnquiryResource
    {
        $enquiry = Enquiry::find($id) ?? abort(404, 'Enquiry not found.');

        return new EnquiryResource($this->enquiries->setStatus($enquiry, $request->status()));
    }
}
