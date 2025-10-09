<?php

namespace Database\Seeders;

use App\Models\Product;
use App\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (Storage::disk('public')->exists('products_image')) {
            Storage::disk('public')->deleteDirectory('products_image');
        }
        Storage::disk('public')->makeDirectory('products_image');

        $catalog = [
            ProductCategory::Food->value => [
                ['name' => 'Nasi Goreng Spesial', 'price' => 25000, "image" => 'food1.jpg'],
                ['name' => 'Ayam Bakar Madu', 'price' => 32000, "image" => 'food2.jpg'],
                ['name' => 'Mie Ayam Jamur', 'price' => 22000, "image" => 'food3.jpg'],
            ],
            ProductCategory::Beverages->value => [
                ['name' => 'Es Teh Manis', 'price' => 8000, "image" => 'beverages1.jpg'],
                ['name' => 'Kopi Susu Gula Aren', 'price' => 18000, "image" => 'beverages2.jpg'],
                ['name' => 'Jus Alpukat', 'price' => 20000, "image" => 'beverages3.jpg'],
            ],
            ProductCategory::Snack->value => [
                ['name' => 'Roti Bakar Coklat', 'price' => 15000, "image" => 'snack1.jpeg'],
                ['name' => 'Pisang Goreng Keju', 'price' => 13000, "image" => 'snack2.jpg'],
                ['name' => 'Cireng Bumbu Rujak', 'price' => 12000, "image" => 'snack3.jpg'],
            ],
        ];

        foreach ($catalog as $category => $items) {
            foreach ($items as $item) {

                $sourcePath = resource_path("seed-images/{$item['image']}");
                $targetFilename = uniqid() . '_' . $item['image'];
                $targetPath = "products_image/{$targetFilename}";

                Storage::disk('public')->put($targetPath, file_get_contents($sourcePath));

                Product::updateOrCreate(
                    ['name' => $item['name']],
                    [
                        'price' => $item['price'],
                        'category' => $category,
                        'image_path' => $targetPath,
                        'is_available' => true,
                    ]
                );
            }
        }
    }
}
