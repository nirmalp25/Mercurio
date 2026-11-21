<?php

use App\Modules\Identity\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

pest()->extend(TestCase::class)->in('Unit');

function admin(): User
{
    return User::factory()->admin()->create();
}

function customer(): User
{
    return User::factory()->create();
}
