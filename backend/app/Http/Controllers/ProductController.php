<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\Create as CreateProduct;
use App\Http\Requests\Product\Update as UpdateProduct;
use App\Models\Product;
use App\Service\ProductService;
use Illuminate\Http\Request;


class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['category', 'name', 'price_min', 'price_max']);

        $productsQuery = $this->productService->getProductQuery($filters);

        $perPage = $request->input('perPage', 20);
        $products = $productsQuery->paginate($perPage);

        return response()->json([
            "success" => true,
            "data" => $products
        ],200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateProduct $request)
    {
        $fields = $request->validated();
        $fields['image'] = $request->file('image'); // attach explicitly
        $product = $this->productService->createProduct($fields);

        return response()->json([
            "success" => true,
            "message" => "Berhasil membuat produk",
            "data" => $product
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $products = Product::findOrFail($id);

        return response()->json([
            "success" => true,
            'message' => 'Berhasil mengambil data produk',
            "data" => $products
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProduct $request, string $id)
    {
        $product = Product::findOrFail($id);

        $updatedProduct =  $this->productService->updateProduct($request->validated(), $product);
        return response()->json([
            "success" => true,
            "message" => "Berhasil mengupdate produk",
            "data" => $updatedProduct
        ],201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Product::findOrFail($id);

        $product->delete();
        return response()->json([
            "success" => true,
            "message" => "Berhasil menghapus produk",
        ],201);
    }
}
