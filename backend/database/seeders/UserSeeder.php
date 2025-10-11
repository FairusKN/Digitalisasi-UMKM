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

        // Define the time range
        $start = new \DateTime('2025-01-05');
        $end = new \DateTime('2025-10-11');

        $cashiers->each(function (User $cashier) use ($products, $faker, $start, $end) {
            // Loop through each day in the period
            $period = new \DatePeriod($start, new \DateInterval('P1D'), $end);

            foreach ($period as $date) {
                $dayOfWeek = (int) $date->format('N'); // 1 = Monday, 7 = Sunday

                // Adjust order volume based on weekday/weekend
                $baseCount = match ($dayOfWeek) {
                    1 => $faker->numberBetween(2, 4), // Monday slow
                    2, 3, 4 => $faker->numberBetween(4, 8),
                    5 => $faker->numberBetween(6, 10), // Friday picks up
                    6, 7 => $faker->numberBetween(8, 14), // Sat/Sun busiest
                    default => 5,
                };

                for ($i = 0; $i < $baseCount; $i++) {
                    // Choose products for the order
                    $selectionSize = min($products->count(), $faker->numberBetween(1, 5));
                    $selected = $products->random($selectionSize);
                    $selectedProducts = $selected instanceof Product ? collect([$selected]) : $selected;

                    $total = 0;

                    // Create the order
                    $order = Order::factory()->create([
                        'user_id' => $cashier->id,
                        'customer_name' => $faker->name(),
                        'note' => $faker->boolean(20) ? $faker->sentence() : null,
                        'is_takeaway' => $faker->boolean(30),
                        'payment_method' => $faker->randomElement(array_column(PaymentMethod::cases(), 'value')),
                        'created_at' => $date->format('Y-m-d') . ' ' . $faker->time('H:i:s'),
                        'updated_at' => $date->format('Y-m-d') . ' ' . $faker->time('H:i:s'),
                    ]);

                    foreach ($selectedProducts as $product) {
                        $quantity = $faker->numberBetween(1, 3);
                        $unitPrice = (float) $product->price;

                        OrderItem::create([
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'quantity' => $quantity,
                            'price' => $unitPrice,
                            'created_at' => $order->created_at,
                            'updated_at' => $order->updated_at,
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
                }
            }
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
        return collect(range(1, 3))->map(function (int $index) {
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
