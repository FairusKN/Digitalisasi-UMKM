<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\PaymentMethod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = Product::all();

        $this->seedSuperUsers();
        $this->seedManagers();
        $cashiers = $this->seedCashiers();

        if ($products->isEmpty()) {
            return;
        }

        $faker = fake();

        $cashiers->each(function (User $cashier) use ($products, $faker) {
            $orderCount = $faker->numberBetween(1, 3);

            Order::factory()
                ->count($orderCount)
                ->state(fn () => [
                    'user_id' => $cashier->id,
                    'customer_name' => $faker->name(),
                ])
                ->create()
                ->each(function (Order $order) use ($products, $faker) {
                    $selectionSize = min($products->count(), $faker->numberBetween(1, 3));
                    $selected = $products->random($selectionSize);
                    $selectedProducts = $selected instanceof Product ? collect([$selected]) : $selected;

                    $total = 0;

                    foreach ($selectedProducts as $product) {
                        $quantity = $faker->numberBetween(1, 3);
                        $unitPrice = (float) $product->price;

                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'quantity' => $quantity,
                            'price' => $unitPrice,
                        ]);

                        $total += $quantity * $unitPrice;
                    }

                    $total = round($total, 2);
                    $cashReceived = $order->payment_method === PaymentMethod::Cash->value
                        ? round($total + $faker->randomFloat(2, 1000, 10000), 2)
                        : null;

                    $order->update([
                        'total' => $total,
                        'cash_received' => $cashReceived,
                        'cash_change' => $cashReceived
                            ? round(max($cashReceived - $total, 0), 2)
                            : null,
                    ]);
                });
        });
    }

    private function seedSuperUsers(): void
    {
        $usernames = array_filter(config('superuser.usernames', []));

        foreach ($usernames as $username) {
            User::factory()
                ->manager()
                ->create([
                    'name' => 'Super User',
                    'username' => $username,
                    'password' => Hash::make('superuser'),
                ]);
        }
    }

    private function seedManagers(): void
    {
        foreach (range(1, 5) as $index) {
            User::factory()
                ->manager()
                ->create([
                    'name' => sprintf('Manager %02d', $index),
                    'username' => sprintf('manager%02d', $index),
                    'password' => Hash::make('password'),
                ]);
        }
    }

    private function seedCashiers()
    {
        return collect(range(1, 10))->map(function (int $index) {
            return User::factory()
                ->cashier()
                ->create([
                    'name' => sprintf('Cashier %02d', $index),
                    'username' => sprintf('cashier%02d', $index),
                    'password' => Hash::make('password'),
                ]);
        });
    }
}
