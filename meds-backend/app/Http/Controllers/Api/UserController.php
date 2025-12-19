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
        $data = $request->validate([
            'name' => ['sometimes','required','string','max:255'],
            'email' => ['sometimes','required','email','max:255','unique:users,email,' . $user->id],
            'password' => ['sometimes','required','confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
            'is_admin' => ['sometimes','boolean'], // admin can change admin flag here too if you want
        ]);

        if (array_key_exists('name', $data)) $user->name = $data['name'];
        if (array_key_exists('email', $data)) $user->email = $data['email'];
        if (array_key_exists('password', $data)) $user->password = Hash::make($data['password']);
        if (array_key_exists('is_admin', $data)) $user->is_admin = (bool)$data['is_admin'];

        $user->save();

        return response()->json($user->only(['id','name','email','is_admin','created_at']));
    }

    // DELETE /api/users/{user}
    public function destroy(Request $request, User $user)
    {
        // Safety: prevent deleting yourself
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->tokens()->delete(); // revoke tokens
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
