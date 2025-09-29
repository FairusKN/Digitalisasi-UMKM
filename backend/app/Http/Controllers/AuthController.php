<?php

namespace App\Http\Controllers;

use App\Models\User;
use Hash;
use Illuminate\Http\Request;
use function PHPUnit\Framework\returnArgument;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'phone_number' => 'required|unique:users',
            'password' => 'required|confirmed',
            'is_admin' => 'boolean',
            'is_superuser' => 'boolean',
        ]);

        $user = User::create($fields);

        return response()->json([
            "user" => $user
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
            //'phone_number' => 'required|exists:users',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return [
                "message" => "The Provided Credentials may be Invalid"
            ];
        }

        $token =  $user->createToken($user->name);

        return [
            'user' => $user,
            'token' => $token->plainTextToken
        ];
    }

    public  function logout(Request $request) {
        $request->user()->tokens()->delete();

        return [
            'message' => "You are logout"
        ];
    }
}
