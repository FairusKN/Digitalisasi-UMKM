<?php

namespace Database\Seeders;

use App\Models\Product;
use App\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $catalog = [
            ProductCategory::Food->value => [
                ['name' => 'Nasi Goreng Spesial', 'price' => 25000],
                ['name' => 'Ayam Bakar Madu', 'price' => 32000],
                ['name' => 'Mie Ayam Jamur', 'price' => 22000],
            ],
            ProductCategory::Beverages->value => [
                ['name' => 'Es Teh Manis', 'price' => 8000],
                ['name' => 'Kopi Susu Gula Aren', 'price' => 18000],
                ['name' => 'Jus Alpukat', 'price' => 20000],
            ],
            ProductCategory::Snack->value => [
                ['name' => 'Roti Bakar Coklat', 'price' => 15000],
                ['name' => 'Pisang Goreng Keju', 'price' => 13000],
                ['name' => 'Cireng Bumbu Rujak', 'price' => 12000],
            ],
        ];

        foreach ($catalog as $category => $items) {
            foreach ($items as $item) {
                Product::updateOrCreate(
                    ['name' => $item['name']],
                    [
                        'price' => $item['price'],
                        'category' => $category,
                        'image_path' => 'images/products/' . Str::slug($item['name']) . '.jpg',
                        'is_available' => true,
                    ]
                );
            }
        }
    }
}
