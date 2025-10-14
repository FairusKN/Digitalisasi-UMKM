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
            'customer_name' => 'required|string|max:255',
            'total' => 'required|numeric|min:0',
            'cash_received' => 'nullable|numeric|min:0',
            'note' => 'nullable|string|max:1000',
            'is_takeaway' => 'boolean',
            'payment_method' => ['required', new Enum(PaymentMethod::class)],
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|uuid|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
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
            'customer_name.required' => 'Nama pelanggan wajib diisi',
            'customer_name.string' => 'Nama pelanggan harus berupa teks',
            'customer_name.max' => 'Nama pelanggan maksimal 255 karakter',
            'total.required' => 'Total pesanan wajib diisi',
            'total.numeric' => 'Total harus berupa angka',
            'total.min' => 'Total harus lebih besar atau sama dengan 0',
            'cash_received.numeric' => 'Uang yang diterima harus berupa angka',
            'cash_received.min' => 'Uang yang diterima harus lebih besar atau sama dengan 0',
            'payment_method.required' => 'Metode pembayaran wajib dipilih',
            'items.required' => 'Item pesanan wajib diisi',
            'items.min' => 'Pesanan harus memiliki minimal satu item',
            'items.*.product_id.required' => 'ID produk wajib diisi untuk setiap item',
            'items.*.product_id.exists' => 'Produk yang dipilih tidak ada',
            'items.*.quantity.required' => 'Jumlah wajib diisi untuk setiap item',
            'items.*.quantity.min' => 'Jumlah minimal 1',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $paymentMethod = $this->input('payment_method');
            $cashReceived = $this->input('cash_received');
            $total = $this->input('total');

            // Jika payment method adalah cash, cash_received wajib dan harus >= total
            if ($paymentMethod === 'cash') {
                if (is_null($cashReceived)) {
                    $validator->errors()->add('cash_received', 'Uang yang diterima wajib diisi untuk pembayaran cash');
                } elseif ($cashReceived < $total) {
                    $validator->errors()->add('cash_received', 'Uang yang diterima harus lebih besar atau sama dengan total pesanan');
                }
            }
        });
    }
}
