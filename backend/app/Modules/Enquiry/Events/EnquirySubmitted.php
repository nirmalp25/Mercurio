<?php

namespace App\Modules\Enquiry\Events;

use App\Modules\Enquiry\Models\Enquiry;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** Fired only once the enquiry row is committed, so listeners never see a rolled-back record. */
class EnquirySubmitted implements ShouldDispatchAfterCommit
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Enquiry $enquiry) {}
}
