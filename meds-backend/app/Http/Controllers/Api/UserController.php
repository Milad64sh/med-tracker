<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // GET /api/users
    public function index()
    {
        return response()->json(
            User::query()
                ->select(['id','name','email','is_admin','created_at'])
                ->orderByDesc('created_at')
                ->get()
        );
    }

    // POST /api/users  (optional: create user directly; you can skip if you only use invites)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
            'is_admin' => ['sometimes','boolean'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'is_admin' => (bool)($data['is_admin'] ?? false),
        ]);

        return response()->json($user->only(['id','name','email','is_admin','created_at']), 201);
    }

    // PATCH /api/users/{user}
public function update(Request $request, User $user)
{
    $actor = $request->user();

    // Admin can edit name/email. Owner can do everything.
    $data = $request->validate([
        'name' => ['sometimes','required','string','max:255'],
        'email' => ['sometimes','required','email','max:255','unique:users,email,' . $user->id],

        'password' => ['sometimes','required','confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        'is_admin' => ['sometimes','boolean'],
    ]);

    $isOwner = (($actor->role ?? null) === 'owner');
    $isAdmin = (($actor->role ?? null) === 'admin') || (bool)($actor->is_admin);

    if (!$isAdmin && !$isOwner) {
        return response()->json(['message' => 'Forbidden'], 403);
    }

    // Non-owner cannot change security fields
    if (!$isOwner) {
        unset($data['is_admin'], $data['password']);
    }

    // Extra safety: never allow changing owner’s admin flag via this endpoint
    if (($user->role ?? null) === 'owner' && isset($data['is_admin'])) {
        return response()->json(['message' => 'Owner privileges cannot be changed.'], 422);
    }

    if (array_key_exists('name', $data)) $user->name = $data['name'];
    if (array_key_exists('email', $data)) $user->email = $data['email'];
    if (array_key_exists('password', $data)) $user->password = Hash::make($data['password']);
    if (array_key_exists('is_admin', $data)) $user->is_admin = (bool)$data['is_admin'];

    $user->save();

    return response()->json($user->only(['id','name','email','is_admin','role','created_at']));
}


    // DELETE /api/users/{user}
public function destroy(Request $request, User $user)
{
    $actor = $request->user();

    // 1) Must be authenticated (normally auth:sanctum guarantees this)
    if (!$actor) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }

    // 2) Safety: prevent deleting yourself
    if ($actor->id === $user->id) {
        return response()->json(['message' => 'You cannot delete your own account.'], 422);
    }

    // 3) Hard rule: owner cannot be deleted (ever)
    if (($user->role ?? null) === 'owner') {
        return response()->json(['message' => 'Owner account cannot be deleted.'], 422);
    }

    // 4) Authorization: only owner can delete users (recommended)
    // If you want admins to delete non-owner users, change this logic.
    if (($actor->role ?? null) !== 'owner') {
        return response()->json(['message' => 'Forbidden (owner only)'], 403);
    }

    // Revoke tokens + delete user
    $user->tokens()->delete();
    $user->delete();

    return response()->json(['message' => 'Deleted']);
}


    // PATCH /api/users/{user}/admin  (toggle admin quickly)
    public function setAdmin(Request $request, User $user)
    {
        $data = $request->validate(['is_admin' => ['required','boolean']]);

        // Safety: prevent removing your own admin
        if ($request->user()->id === $user->id && $data['is_admin'] === false) {
            return response()->json(['message' => 'You cannot remove your own admin access.'], 422);
        }

        $user->is_admin = (bool)$data['is_admin'];
        $user->save();

        return response()->json($user->only(['id','name','email','is_admin','created_at']));
    }
}
