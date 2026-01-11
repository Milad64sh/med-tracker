<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'role',      // owner|admin|user
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_admin'          => 'boolean',
        ];
    }

    public function isOwner(): bool
    {
        return ($this->role ?? null) === 'owner';
    }

    public function isAdmin(): bool
    {
        // Owner counts as admin power
        return $this->isOwner()
            || ($this->role ?? null) === 'admin'
            || (bool)($this->is_admin ?? false); // legacy support
    }
}
