<?php

namespace App\Http\Requests\Product;

use App\ProductCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class Update extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "name" => "nullable|string|unique:products",
            "price" => "nullable|numeric|min:5000|max:9999999999.99",
            "category" => ["nullable", new Enum(ProductCategory::class)],
            "image" => "nullable|file|mimes:jpg,jpeg,png|max:5120",
        ];
    }
}
