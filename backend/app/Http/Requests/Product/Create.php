<?php

namespace App\Http\Requests\Product;

use App\ProductCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class Create extends FormRequest
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
            "name" => "required|string|unique:products",
            "price" => "required|numeric|min:5000|max:9999999999.99",
            "category" => ["required", new Enum(ProductCategory::class)],
            "image" => "required|file|mimes:jpg,jpeg,png|max:5120",
        ];
    }
}
