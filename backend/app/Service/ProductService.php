<?php

namespace App\Service;

use App\Http\Requests\Product\Create as CreateProduct;
use App\Models\Product;
use App\ProductCategory;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use Spatie\ImageOptimizer\OptimizerChainFactory;

class ProductService
{
    protected string $storageFolder;

    public function __construct()
    {
        $this->storageFolder = "products_image";
    }

    public function getProductQuery(array $filters = [])
    {
        $query = Product::query();

        if (isset($filters['category'])) {
            if (!ProductCategory::tryFrom($filters['category'])) {
                // Throw an exception instead of returning a response
                throw new InvalidArgumentException("Invalid category value: {$filters['category']}");
            }
            $query->where('category', $filters['category']);
        }

        if (isset($filters['name'])) {
            $query->where('name', 'like', "%{$filters['name']}%");
        }

        if (isset($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }

        if (isset($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }

        return $query;
    }

    /**
     * Create product with image
     */
    public function createProduct(array $fields)
    {
        DB::beginTransaction();
        try {
            if (!empty($fields['image'])) {
                $fields['image_path'] = $this->processImage($fields['image']);
                unset($fields['image']);
            }
            $product = Product::create($fields);

            DB::commit();
            return $product;
        } catch (QueryException $e) {
            if (!empty($fields['image_path'])) {
                $this->deleteImage($fields['image_path']);
            }
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update product with optional image
     */
    public function updateProduct(array $fields, Product $product)
    {
        $oldImagePath = $product->image_path ?? null;
        $newFilePath = null;

        DB::beginTransaction();
        try {
            if (!empty($fields['image'])) {
                $newFilePath = $this->processImage($fields['image']);
                $fields['image_path'] = $newFilePath;
                unset($fields['image']);
            }

            $product->update($fields);
            DB::commit();

            // Only delete old image after DB commit success
            if ($newFilePath && $oldImagePath) {
                $this->deleteImage($oldImagePath);
            }

            return $product;
        } catch (QueryException $e) {
            DB::rollBack();

            if ($newFilePath) {
                $this->deleteImage($newFilePath);
            }

            throw $e;
        }
    }

    /**
     * Optimize and store image, returns stored path
     */
    private function processImage(UploadedFile $image): string
    {
        $optimizer = OptimizerChainFactory::create();

        try {
            $optimizer->optimize($image->getPathname());
        } catch (Exception $e) {
            //
        }

        $fileName = bin2hex(random_bytes(32)) . "." . $image->extension();
        return $image->storeAs($this->storageFolder, $fileName, "public");
    }

    /**
     * Delete an image file safely
     */
    private function deleteImage(?string $path): void
    {
        if ($path) {
            Storage::disk('public')->delete($path);
        }
    }
}
