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
     * Get all orders with optional filtering
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

    /**
     * Get order by ID
     *
     * @param string $id
     * @return Order|null
     */
    public function getById(string $id): ?Order
    {
        return Order::with(['items.product', 'user'])->find($id);
    }

    /**
     * Get orders by user ID
     *
     * @param string $userId
     * @return Collection
     */
    public function getByUserId(string $userId): Collection
    {
        return Order::with(['items.product'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Update order status or other fields
     *
     * @param string $id
     * @param array $fields
     * @return Order|null
     */
    public function update(string $id, array $fields): ?Order
    {
        $order = Order::find($id);
        
        if (!$order) {
            return null;
        }

        $order->update($fields);
        $order->load(['items.product', 'user']);

        return $order;
    }

    /**
     * Delete order
     *
     * @param string $id
     * @return bool
     */
    public function delete(string $id): bool
    {
        $order = Order::find($id);
        
        if (!$order) {
            return false;
        }

        try {
            DB::beginTransaction();

            // Delete order items first
            $order->items()->delete();
            
            // Delete the order
            $order->delete();

            DB::commit();

            return true;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
