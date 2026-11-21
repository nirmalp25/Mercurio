<?php

namespace App\Modules\Notifier;

use App\Modules\Notifier\Contracts\EnquiryNotifier;
use App\Modules\Notifier\Drivers\MailNotifier;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;

/** Resolves the configured notification provider by name (see Notifier/config.php). */
class NotifierFactory
{
    public function __construct(private readonly Container $container) {}

    public function make(?string $driver = null): EnquiryNotifier
    {
        $driver ??= (string) config('notifier.driver', 'null');
        $class = config("notifier.drivers.{$driver}");

        if (! $class || ! is_subclass_of($class, EnquiryNotifier::class)) {
            throw new InvalidArgumentException("Unknown enquiry notifier driver [{$driver}].");
        }

        return match ($class) {
            MailNotifier::class => new MailNotifier((string) config('notifier.mail.to')),
            default => $this->container->make($class),
        };
    }
}
