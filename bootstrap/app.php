<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->alias([
            'role' => \App\Http\Middleware\HandleUserRole::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withCommands([
        \App\Console\Commands\DeactivateInactiveUsers::class,
        \App\Console\Commands\ActivateActiveUsers::class,
        \App\Console\Commands\NotifyUsersMonthlyContribution::class,
    ])
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('app:deactivate-inactive-users')->daily(); // Run every day at midnight
        $schedule->command('app:activate-active-users')->daily(); // Run every day at midnight
        $schedule->command('app:notify-users-monthly-contribution')->monthlyOn(1); // Run every 1st of the month at 8 AM
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // 🧱 Forbidden – 403
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 403) {
                return response()->view('errors.403', [], 403);
            }
        });

        // 🔍 Not Found – 404
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, $request) {
            return response()->view('errors.404', [], 404);
        });

        // ⚙️ Internal Server Error – 500
        $exceptions->render(function (Throwable $e, $request) {
            if (
                $e instanceof \Symfony\Component\HttpKernel\Exception\HttpException &&
                $e->getStatusCode() === 500
            ) {
                return response()->view('errors.500', [], 500);
            }

            // Laravel debug mode
            if (app()->hasDebugModeEnabled()) {
                return null;
            }
        });

        // 🌐 HTTP Version Not Supported – 505
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($e->getStatusCode() === 505) {
                return response()->view('errors.505', [], 505);
            }
        });

        // 🧩 Fallback for any other unhandled errors
        $exceptions->render(function (Throwable $e, $request) {
            if (app()->hasDebugModeEnabled()) {
                return null;
            }

            return response()->view('errors.general', [
                'message' => 'Something went wrong on our end. Please try again later.',
            ], 500);
        });
    })
    ->create();
