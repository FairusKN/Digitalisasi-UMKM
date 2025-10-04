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
                'message' => 'The provided credentials may be invalid'
            ], 400);
        }

        $token = $user->createToken(
            $user->name,
            ['*'],
            now()->addMinutes(config('sanctum.expiration'))
        );

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
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
            'message' => 'You have been logged out successfully'
        ], 200);
    }
}
