<?php

namespace Database\Seeders;

use App\Modules\Identity\Database\Seeders\AdminUserSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Products are not seeded here: they come from `php artisan catalogue:sync`.
        $this->call(AdminUserSeeder::class);
    }
}
