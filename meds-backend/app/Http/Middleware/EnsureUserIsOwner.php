<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsOwner
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (($user->role ?? null) !== 'owner') {
            return response()->json(['message' => 'Forbidden (owner only)'], 403);
        }

        return $next($request);
    }
}

