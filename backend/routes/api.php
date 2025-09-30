<?php


use App\Http\Controllers\AuthController;
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
})
?>
