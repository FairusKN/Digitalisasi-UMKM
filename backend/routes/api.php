<?php


use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get("/", function() {
    return view("welcome");
});

Route::prefix("auth")->group(function () {
    Route::post("register", [AuthController::class, 'register'])
        ->middleware('auth:sanctum', 'role:super_user');

    //any users
    Route::post("login", [AuthController::class, 'login']);
    Route::post("logout", [AuthController::class, 'logout'])
        ->middleware('auth:sanctum');
})

?>
