<?php

namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // owner OR admin OR legacy is_admin
        $isAllowed =
            ($user->role ?? null) === 'owner' ||
            ($user->role ?? null) === 'admin' ||
            (bool)($user->is_admin ?? false);

        if (!$isAllowed) {
            return response()->json(['message' => 'Forbidden (admin only)'], 403);
        }

        return $next($request);
    }
}
