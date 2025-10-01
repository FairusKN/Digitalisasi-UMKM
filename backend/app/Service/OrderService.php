<?php

namespace App\Service;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Exception;

class OrderService
{
    public function __construct()
    {
        //
    }

    /**
     * Create a new order with items
     *
     * @param array $fields
     * @param string $userId
     * @return Order
     * @throws Exception
     */
    public function create(array $fields, string $userId): Order
    {
        try {
            DB::beginTransaction();

            // Create the order
            $order = Order::create([
                'user_id' => $userId,
                'total' => $fields['total'],
                'note' => $fields['note'] ?? null,
                'is_takeaway' => $fields['is_takeaway'] ?? false,
                'payment_method' => $fields['payment_method'],
            ]);

            // Create order items
            foreach ($fields['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            DB::commit();

            // Load relationships for response
            $order->load(['items.product', 'user']);

            return $order;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get all orders with optional filtering (for manager analytics/dashboard)
     *
     * @param array $filters
     * @return Collection
     */
    public function getAll(array $filters = []): Collection
    {
        $query = Order::with(['items.product', 'user']);

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (isset($filters['is_takeaway'])) {
            $query->where('is_takeaway', $filters['is_takeaway']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
