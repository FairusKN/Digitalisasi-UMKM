<?php

use App\Http\Middleware\CheckTokenExpiration;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SuperUserMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;


return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'superuser' => SuperUserMiddleware::class,
            'checktoken' => CheckTokenExpiration::class
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sumber daya tidak ditemukan'
                ], 404);
            }

            if ($e instanceof \Illuminate\Database\QueryException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kesalahan database',
                    'error' => $e->getMessage()
                ], 500);
            }

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validasi gagal',
                    'errors' => $e->errors()
                ], 422);
            }

            if ($e instanceof InvalidArgumentException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Argumen salah',
                    'error' => $e->getMessage()
                ], 422);
            }

            // Default fallback for other exceptions
            return response()->json([
                'success' => false,
                'message' => 'Kesalahan server internal',
                'error' => $e->getMessage()
            ], 500);
        });


    })->create();
