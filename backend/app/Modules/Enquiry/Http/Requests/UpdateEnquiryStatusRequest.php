<?php

namespace App\Modules\Enquiry\Http\Requests;

use App\Modules\Enquiry\Enums\EnquiryStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEnquiryStatusRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(EnquiryStatus::class)],
        ];
    }

    public function status(): EnquiryStatus
    {
        return EnquiryStatus::from($this->validated('status'));
    }
}
