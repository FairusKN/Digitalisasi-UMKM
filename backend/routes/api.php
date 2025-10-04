<?php


use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get("/", fn() => response()->json(["success" => true]));

Route::prefix("auth")->group(function () {
    Route::post("login", [AuthController::class, 'login']);
    Route::post("logout", [AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
});

// Order routes
Route::middleware(['auth:sanctum', 'checktoken'])->group(function () {
    Route::prefix('orders')->group(function () {
        Route::post('/', [OrderController::class, 'store']);
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

        Route::prefix("users")->group(function() {
            Route::get("/", [UserController::class, "index"]);
            Route::get("/{id}", [UserController::class, "show"])
                ->whereUuid("id");
            Route::post("/", [UserController::class, "store"]);
            Route::put("/{id}", [UserController::class, "update"])
                ->whereUuid("id");
            Route::delete("/{id}", [UserController::class, "destroy"])
                ->whereUuid("id");
        });
    });

});
?>
