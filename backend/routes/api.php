<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get("/", function() {
    return response()->json([
        'success' => true,
        'message' => "API is working"
    ], 200);
});

Route::prefix("auth")->group(function () {
    Route::post("register", [AuthController::class, 'register'])
        ->middleware('auth:sanctum', 'role:manager');

    Route::post("login", [AuthController::class, 'login']);
    Route::post("logout", [AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
});

// Order routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']); // Untuk manager analytics/dashboard
        Route::post('/', [OrderController::class, 'store']); // Untuk cashier buat order
    });

    Route::prefix("manager")->middleware("role:manager")->group(function () {
        Route::prefix("products")->group(function() {
            Route::get('/', [ProductController::class, "index"]);
            Route::get('/{id}', [ProductController::class, "show"])
                ->whereUuid('id');
            Route::post('/', [ProductController::class, 'store']);
            Route::put('/{id}', [ProductController::class, 'update'])
                ->whereUuid('id');
            Route::delete('/{id}', [ProductController::class, 'destroy'])
                ->whereUuid('id');
        });
    });

});
?>
