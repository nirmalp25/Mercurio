<?php

namespace App\Modules\Enquiry\Http\Requests;

use App\Modules\Enquiry\DTO\EnquiryData;
use Illuminate\Foundation\Http\FormRequest;
use Propaganistas\LaravelPhone\PhoneNumber;
use Propaganistas\LaravelPhone\Rules\Phone;

class StoreEnquiryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'countryCode' => is_string($this->countryCode) ? strtoupper(trim($this->countryCode)) : $this->countryCode,
            'email' => is_string($this->email) ? trim($this->email) : $this->email,
        ]);
    }

    public function rules(): array
    {
        return [
            'productId' => ['required', 'integer', 'exists:products,id'],
            'firstName' => ['required', 'string', 'max:100'],
            'lastName' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'countryCode' => ['required', 'string', 'size:2', 'alpha'],
            'phone' => ['required', 'string', 'max:30', (new Phone)->countryField('countryCode')],
            'query' => ['required', 'string', 'max:1000'],
            // Honeypot: hidden in the UI, so only bots fill it.
            'website' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.phone' => 'Enter a valid phone number for the selected country.',
            'website.prohibited' => 'Invalid submission.',
        ];
    }

    public function toData(): EnquiryData
    {
        $v = $this->validated();

        return new EnquiryData(
            productId: (int) $v['productId'],
            firstName: trim($v['firstName']),
            lastName: trim($v['lastName']),
            email: $v['email'],
            countryCode: $v['countryCode'],
            phone: (new PhoneNumber($v['phone'], $v['countryCode']))->formatE164(),
            query: trim($v['query']),
        );
    }
}
