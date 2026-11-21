<?php

namespace App\Modules\Enquiry\Database\Factories;

use App\Modules\Enquiry\Enums\EnquiryStatus;
use App\Modules\Enquiry\Models\Enquiry;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Enquiry> */
class EnquiryFactory extends Factory
{
    protected $model = Enquiry::class;

    public function definition(): array
    {
        return [
            'product_id' => null,
            'product_title' => fake()->words(3, true),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->safeEmail(),
            'country_code' => 'GB',
            'phone' => '+447911123456',
            'query' => fake()->sentence(),
            'status' => EnquiryStatus::New,
            'enquired_at' => now(),
        ];
    }
}
