<?php

namespace App\Http\Middleware;

use Auth;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = Auth::user(); // already guaranteed by `auth:sanctum`

        if (!in_array($role, ['admin', 'super_user'], true)) {
            return response()->json([
                "message" => "Invalid role specified"
            ], 400);
        }

        if ($role === 'admin' && !$user->is_admin) {
            return response()->json([
                "message" => "Bro is not an admin"
            ], 403);
        }

        if ($role === 'super_user' && !$user->is_superuser) {
            return response()->json([
                "message" => "Bro is not a super user"
            ], 403);
        }

        return $next($request);
    }
}
