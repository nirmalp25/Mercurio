<?php

namespace App\Modules\Catalogue\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SetTopRatedRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'isTopRated' => ['required', 'boolean'],
        ];
    }
}
