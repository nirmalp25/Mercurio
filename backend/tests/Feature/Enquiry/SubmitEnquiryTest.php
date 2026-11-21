<?php

use App\Modules\Catalogue\Models\Product;
use App\Modules\Enquiry\Models\Enquiry;
use App\Modules\Notifier\Contracts\EnquiryNotifier;
use App\Modules\Notifier\Mail\EnquiryReceived;
use App\Modules\Notifier\NotifierFactory;
use Illuminate\Support\Facades\Mail;

function validEnquiry(array $overrides = []): array
{
    return array_merge([
        'productId' => Product::factory()->create(['title' => 'Gold Ring'])->id,
        'firstName' => 'Asha',
        'lastName' => 'Rao',
        'email' => 'asha@example.com',
        'countryCode' => 'IN',
        'phone' => '98765 43210',
        'query' => 'Is this available in size 7?',
    ], $overrides);
}

it('stores a valid enquiry and thanks the customer', function () {
    Mail::fake();

    $this->postJson('/api/enquiries', validEnquiry())
        ->assertCreated()
        ->assertJsonPath('message', 'Thank you')
        ->assertJsonStructure(['data' => ['id', 'enquiredAt']])
        ->assertJsonMissingPath('data.email'); // no PII echoed back

    $enquiry = Enquiry::sole();
    expect($enquiry->product_title)->toBe('Gold Ring')
        ->and($enquiry->phone)->toBe('+919876543210') // normalised to E.164
        ->and($enquiry->status->value)->toBe('new')
        ->and($enquiry->enquired_at)->not->toBeNull();
});

it('rejects invalid input', function (array $override, string $field) {
    $this->postJson('/api/enquiries', validEnquiry($override))
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);

    expect(Enquiry::count())->toBe(0);
})->with([
    'missing first name' => [['firstName' => ''], 'firstName'],
    'missing last name' => [['lastName' => null], 'lastName'],
    'bad email' => [['email' => 'not-an-email'], 'email'],
    'phone invalid for country' => [['phone' => '12345'], 'phone'],
    'bad country code' => [['countryCode' => 'IND'], 'countryCode'],
    'query too long' => [['query' => str_repeat('a', 1001)], 'query'],
    'missing query' => [['query' => ''], 'query'],
    'unknown product' => [['productId' => 999999], 'productId'],
    'honeypot filled' => [['website' => 'http://spam.example'], 'website'],
]);

it('rate limits submissions per client', function () {
    Mail::fake();
    $payload = validEnquiry();

    foreach (range(1, 5) as $_) {
        $this->postJson('/api/enquiries', $payload)->assertCreated();
    }

    $this->postJson('/api/enquiries', $payload)->assertTooManyRequests();
});

it('sends no email with the null notifier but still stores the enquiry', function () {
    config(['notifier.driver' => 'null']);
    Mail::fake();

    $this->postJson('/api/enquiries', validEnquiry())->assertCreated();

    Mail::assertNothingSent();
    expect(Enquiry::count())->toBe(1);
});

it('emails the sales inbox with the mail notifier', function () {
    config(['notifier.driver' => 'mail', 'notifier.mail.to' => 'sales@mercurio.test']);
    Mail::fake();

    $this->postJson('/api/enquiries', validEnquiry())->assertCreated();

    Mail::assertSent(EnquiryReceived::class, fn (EnquiryReceived $mail) => $mail->hasTo('sales@mercurio.test')
        && $mail->hasReplyTo('asha@example.com')
        && $mail->enquiry->productTitle === 'Gold Ring');
});

it('still thanks the customer when the notifier fails', function () {
    $failing = new class implements EnquiryNotifier
    {
        public function notify(\App\Modules\Notifier\DTO\EnquiryNotification $notification): void
        {
            throw new RuntimeException('SMTP down');
        }
    };
    $this->mock(NotifierFactory::class)->shouldReceive('make')->andReturn($failing);

    $this->postJson('/api/enquiries', validEnquiry())->assertCreated();

    expect(Enquiry::count())->toBe(1);
});
