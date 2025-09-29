<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\Login;
use App\Http\Requests\Auth\Register;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Register $request) : JsonResponse
    {
        try {
            $user = User::create($request->validated());

            return response()->json([
                "user" => $user
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23505') { // Unique Code Violation
                return response()->json([
                    'message' => 'Username already taken'
                ], 409);
            }

            throw $e;
        }
    }

    public function login(Login $request): JsonResponse
    {
        $fields = $request->validated();
        $user = User::where('username', $fields["username"])->first();

        if (!$user || !Hash::check($fields["password"], $user->password)) {
            return response()->json([
                "message" => "The Provided Credentials may be Invalid"
            ], 400);
        }

        $token = $user->createToken(
            $user->name,
            ['*'],
            now()->addMinutes(config('sanctum.expiration'))
        );

        return response()->json([
            'user' => $user,
            'token' => $token->plainTextToken
        ], 201);
    }

    public  function logout(Request $request) : JsonResponse {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => "You are logout"
        ], 201);
    }
}
