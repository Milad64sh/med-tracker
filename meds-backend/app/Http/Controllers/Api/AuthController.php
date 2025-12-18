<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use App\Models\Invite;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{

public function register(Request $request)
{
    $data = $request->validate([
        'name'         => ['required', 'string', 'max:255'],
        'email'        => ['required', 'email', 'max:255', 'unique:users,email'],
        'password'     => ['required', 'confirmed', Password::min(12)->mixedCase()->numbers()->symbols()],
        'invite_token' => ['required', 'string'],
    ]);

    return DB::transaction(function () use ($data) {

        $invite = Invite::where('token', hash('sha256', $data['invite_token']))
            ->lockForUpdate()
            ->first();

        if (!$invite || !$invite->isValid() || $invite->email !== $data['email']) {
            return response()->json(['message' => 'Invalid or expired invite.'], 403);
        }

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $invite->update(['used_at' => now()]);

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token], 201);
    });
}



    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.'
            ], 422);
        }

        // Optional: revoke old tokens
        $user->tokens()->delete();

        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        // revoke the current token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = PasswordBroker::sendResetLink(
            $request->only('email')
        );

        return $status === PasswordBroker::RESET_LINK_SENT
            ? response()->json(['message' => 'Password reset link sent'])
            : response()->json(['message' => 'Unable to send reset link'], 422);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => [
                'required',
                'confirmed',
                Password::min(12)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $status = PasswordBroker::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                $user->tokens()->delete(); // revoke all tokens
                event(new PasswordReset($user));
            }
        );

        return $status === PasswordBroker::PASSWORD_RESET
            ? response()->json(['message' => 'Password reset successfully'])
            : response()->json(['message' => 'Invalid token'], 422);
    }

    public function update(Request $request)
{
    /** @var \App\Models\User $user */
    $user = $request->user();

    $data = $request->validate([
        'name'  => ['sometimes', 'required', 'string', 'max:255'],
        'email' => [
            'sometimes',
            'required',
            'email',
            'max:255',
            // ignore the current user's email in unique check
            'unique:users,email,' . $user->id,
        ],
        // if you later want to allow password change here, you can add:
        // 'password' => [
        //     'sometimes',
        //     'required',
        //     'confirmed',
        //     Password::min(12)->mixedCase()->numbers()->symbols(),
        // ],
    ]);

    // Apply changes
    if (array_key_exists('name', $data)) {
        $user->name = $data['name'];
    }

    if (array_key_exists('email', $data)) {
        $user->email = $data['email'];
    }

    // if (array_key_exists('password', $data)) {
    //     $user->password = Hash::make($data['password']);
    // }

    $user->save();

    return response()->json($user);
}

}
