<?php

namespace App\Modules\Notifier\Mail;

use App\Modules\Notifier\DTO\EnquiryNotification;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class EnquiryReceived extends Mailable
{
    public function __construct(public readonly EnquiryNotification $enquiry) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            // Sales can hit "reply" to answer the customer directly.
            replyTo: [new Address($this->enquiry->email, $this->enquiry->name)],
            subject: "New enquiry: {$this->enquiry->productTitle}",
        );
    }

    public function content(): Content
    {
        return new Content(view: 'mail.enquiry-received');
    }
}
