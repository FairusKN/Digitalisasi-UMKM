<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\Login;
use App\Http\Requests\Auth\Register;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function me(): JsonResponse
    {
        return response()->json();
    }

    public function login(Login $request): JsonResponse
    {
        $fields = $request->validated();
        $user = User::where('username', $fields["username"])->first();

        if (!$user || !Hash::check($fields["password"], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial yang diberikan mungkin tidak valid'
            ], 400);
        }

        $token = $user->createToken(
            $user->name,
            ['*'],
            now()->addMinutes(config('sanctum.expiration'))
        );

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'token' => $token->plainTextToken
            ]
        ], 200);
    }

    public function logout(Request $request) : JsonResponse {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Anda telah berhasil logout'
        ], 200);
    }
}
