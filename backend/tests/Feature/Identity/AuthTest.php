<?php

use App\Modules\Identity\Database\Seeders\AdminUserSeeder;
use App\Modules\Identity\Models\User;

it('seeds an admin from config, idempotently', function () {
    config(['identity.admin.email' => 'boss@mercurio.test', 'identity.admin.password' => 'secret123']);

    $this->seed(AdminUserSeeder::class);
    $this->seed(AdminUserSeeder::class);

    expect(User::where('email', 'boss@mercurio.test')->sole()->isAdmin())->toBeTrue();
});

it('logs in with valid credentials and returns the role', function () {
    $user = User::factory()->admin()->create(['password' => 'secret123']);

    // Sanctum only starts a session for requests from the configured SPA origin.
    $this->withHeader('Origin', 'http://localhost:5173')
        ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret123'])
        ->assertOk()
        ->assertJsonPath('data.role', 'admin');
});

it('rejects invalid credentials', function () {
    $user = User::factory()->create(['password' => 'secret123']);

    $this->withHeader('Origin', 'http://localhost:5173')
        ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'wrong'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('returns the current user only when authenticated', function () {
    $this->getJson('/api/auth/me')->assertUnauthorized();
    $this->actingAs(customer())->getJson('/api/auth/me')->assertOk()->assertJsonPath('data.role', 'customer');
});
