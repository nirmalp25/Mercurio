<?php

namespace App\Modules\Catalogue\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    public function rules(): array
    {
        // Suggestions need 2+ chars to be meaningful; a full search accepts any term.
        $min = $this->routeIs('products.suggest') ? 2 : 1;

        return [
            'q' => ['required', 'string', "min:{$min}", 'max:100'],
        ];
    }

    public function term(): string
    {
        return trim((string) $this->validated('q'));
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['q' => is_string($this->q) ? trim($this->q) : $this->q]);
    }
}
