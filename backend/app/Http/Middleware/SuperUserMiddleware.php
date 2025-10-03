<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SuperUserMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    private $SUPER_USER_USERNAME;

    public function __construct()
    {
        $this->SUPER_USER_USERNAME = config('superuser.usernames');
    }

    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $current_username = $user->username;

        if(!in_array($current_username, $this->SUPER_USER_USERNAME, true)){
            return response()->json([
                'success' => false,
                'message' => 'Forbidden'
            ], 403);
        }

        return $next($request);
    }
}
