<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::get("/", function() {
return response()->json([
    "message" => "it's working"
], 201);
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
});
?>
