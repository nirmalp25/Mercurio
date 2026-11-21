<?php

namespace App\Modules\Identity\Database\Seeders;

use App\Modules\Identity\Enums\Role;
use App\Modules\Identity\Models\User;
use Illuminate\Database\Seeder;

/** Creates (or updates) the demo admin from ADMIN_EMAIL / ADMIN_PASSWORD. Idempotent. */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('identity.admin.email');
        $password = config('identity.admin.password');

        if (! $email || ! $password) {
            $this->command?->warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed.');

            return;
        }

        $user = User::firstOrNew(['email' => $email]);
        $user->forceFill([
            'name' => 'Admin',
            'password' => $password,
            'role' => Role::Admin,
        ])->save();
    }
}
