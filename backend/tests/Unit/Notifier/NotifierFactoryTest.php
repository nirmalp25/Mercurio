<?php

use App\Modules\Notifier\Contracts\EnquiryNotifier;
use App\Modules\Notifier\Drivers\MailNotifier;
use App\Modules\Notifier\Drivers\NullNotifier;
use App\Modules\Notifier\NotifierFactory;

it('defaults to the null notifier', function () {
    config(['notifier.driver' => 'null']);

    expect(app(NotifierFactory::class)->make())->toBeInstanceOf(NullNotifier::class)
        ->and(app(EnquiryNotifier::class))->toBeInstanceOf(NullNotifier::class);
});

it('resolves the mail notifier by name', function () {
    expect(app(NotifierFactory::class)->make('mail'))->toBeInstanceOf(MailNotifier::class);
});

it('throws on an unknown driver', function () {
    app(NotifierFactory::class)->make('carrier-pigeon');
})->throws(InvalidArgumentException::class, 'carrier-pigeon');
