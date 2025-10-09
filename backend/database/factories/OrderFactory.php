<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'total' => fake()->randomFloat(2, 10000, 750000),
            'note' => fake()->optional(0.4)->sentence(),
            'is_takeaway' => fake()->boolean(30),
            'payment_method' => fake()->randomElement(PaymentMethod::cases())->value,
        ];
    }
}
