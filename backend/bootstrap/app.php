<?php

use App\Modules\Identity\Http\Middleware\EnsureAdmin;
use App\Shared\Exceptions\DomainException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // API routes are registered by each module's service provider (see app/Modules/*).
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Sanctum SPA (cookie) auth for requests from the configured frontend origin.
        $middleware->statefulApi();
        $middleware->alias(['admin' => EnsureAdmin::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Domain rule violations map to a consistent {message, code} envelope.
        $exceptions->render(fn (DomainException $e) => response()->json(
            ['message' => $e->getMessage(), 'code' => $e->errorCode()],
            $e->status(),
        ));
    })->create();
