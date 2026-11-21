<?php

namespace App\Modules\Enquiry\Models;

use App\Modules\Enquiry\Database\Factories\EnquiryFactory;
use App\Modules\Enquiry\Enums\EnquiryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property ?int $product_id
 * @property string $product_title
 * @property string $first_name
 * @property string $last_name
 * @property string $email
 * @property string $country_code
 * @property string $phone
 * @property string $query
 * @property EnquiryStatus $status
 * @property \Illuminate\Support\Carbon $enquired_at
 */
class Enquiry extends Model
{
    /** @use HasFactory<EnquiryFactory> */
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'status' => EnquiryStatus::class,
            'enquired_at' => 'datetime',
        ];
    }

    public function fullName(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    protected static function newFactory(): EnquiryFactory
    {
        return EnquiryFactory::new();
    }
}
