<?php

namespace App\Http\Requests\Order;

use App\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class CreateOrder extends FormRequest
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
            'total' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:1000',
            'is_takeaway' => 'boolean',
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'total.required' => 'Total amount is required',
            'total.numeric' => 'Total must be a valid number',
            'total.min' => 'Total must be greater than or equal to 0',
            'payment_method.required' => 'Payment method is required',
            'items.required' => 'Order items are required',
            'items.min' => 'Order must have at least one item',
            'items.*.product_id.required' => 'Product ID is required for each item',
            'items.*.product_id.exists' => 'Selected product does not exist',
            'items.*.quantity.required' => 'Quantity is required for each item',
            'items.*.quantity.min' => 'Quantity must be at least 1',
            'items.*.price.required' => 'Price is required for each item',
            'items.*.price.min' => 'Price must be greater than or equal to 0',
        ];
    }
}
