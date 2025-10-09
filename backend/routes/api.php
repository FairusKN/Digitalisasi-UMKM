<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\UserController;
use App\Service\SummaryService;
use Illuminate\Support\Facades\Route;

Route::get("/", fn() => response()->json(["success" => true]));

Route::prefix("auth")->group(function () {
    Route::post("login", [AuthController::class, 'login']);
    Route::post("logout", [AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
});

Route::middleware(['auth:sanctum', 'checktoken'])->group(function () {
    Route::prefix('orders')->group(function () {
        Route::post('/', [OrderController::class, 'store']);
    });

    Route::prefix("manager")->middleware("role:manager")->group(function () {
        Route::apiResource("products", ProductController::class)->whereUuid("product");
        Route::apiResource("users", UserController::class)->whereUuid("user");
    });

    Route::prefix("summary")->group(function() {
        Route::get('cashier/today', [SummaryController::class, 'cashier'])
            ->middleware('role:cashier');
        Route::get("/", [SummaryService::class, 'summary'])
            ->middleware("role:manager");
    });
});

//Product for public/cashier
Route::prefix("products")->group(function() {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/{id}', [ProductController::class, 'show'])
        ->whereUuid("id");
})
?>
