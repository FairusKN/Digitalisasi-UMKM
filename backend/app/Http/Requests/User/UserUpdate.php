<?php

namespace App\Http\Requests\User;

use App\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UserUpdate extends FormRequest
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
            'name' => 'nullable',
            'username' => 'nullable|string|unique:users,username',
            'password' => 'nullable|confirmed',
            'role' => ['nullable', new Enum(Role::class)],
        ];
    }
}
