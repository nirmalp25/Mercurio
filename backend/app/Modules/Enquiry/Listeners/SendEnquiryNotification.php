<?php

namespace App\Modules\Enquiry\Listeners;

use App\Modules\Enquiry\Events\EnquirySubmitted;
use App\Modules\Notifier\DTO\EnquiryNotification;
use App\Modules\Notifier\NotifierFactory;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Bridges Enquiry -> Notifier. A notification failure is logged, never rethrown:
 * the enquiry is already stored and visible to admins, so the customer still gets "Thank you".
 * (Next step: make this ShouldQueue with retries once a real queue worker exists.)
 */
class SendEnquiryNotification
{
    public function __construct(private readonly NotifierFactory $notifiers) {}

    public function handle(EnquirySubmitted $event): void
    {
        $enquiry = $event->enquiry;

        try {
            $this->notifiers->make()->notify(new EnquiryNotification(
                name: $enquiry->fullName(),
                email: $enquiry->email,
                phone: $enquiry->phone,
                productTitle: $enquiry->product_title,
                query: $enquiry->query,
                enquiredAt: $enquiry->enquired_at,
            ));
        } catch (Throwable $e) {
            Log::error('Enquiry notification failed', ['enquiry_id' => $enquiry->id, 'error' => $e->getMessage()]);
        }
    }
}
