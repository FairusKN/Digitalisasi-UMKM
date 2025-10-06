<?php

namespace App\Service;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;
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
     * @throws QueryException|Exception
     */
    public function create(array $fields, string $userId): Order
    {
        try {
            DB::beginTransaction();

            // Calculate cash change if payment method is cash
            $cashReceived = $fields['cash_received'] ?? null;
            $cashChange = null;
            
            if ($fields['payment_method'] === 'cash' && $cashReceived !== null) {
                $cashChange = $cashReceived - $fields['total'];
            }

            // Create the order
            $order = Order::create([
                'user_id' => $userId,
                'customer_name' => $fields['customer_name'],
                'total' => $fields['total'],
                'cash_received' => $cashReceived,
                'cash_change' => $cashChange,
                'note' => $fields['note'] ?? null,
                'is_takeaway' => $fields['is_takeaway'] ?? false,
                'payment_method' => $fields['payment_method'],
            ]);

            // Create order items
            foreach ($fields['items'] as $item) {
                // Get price from product automatically
                $product = Product::findOrFail($item['product_id']);

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ]);
            }

            DB::commit();

            // Load relationships for response
            $order->load(['items.product', 'user']);

            return $order;

        } catch (QueryException $e) {
            DB::rollBack();
            throw new QueryException(
                $e->getConnectionName(),
                $e->getSql(),
                $e->getBindings(),
                $e->getPrevious()
            );
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get order count with optional filtering (for manager analytics/charts)
     *
     * @param array $filters
     * @return int
     */
    public function getOrderCount(array $filters = []): int
    {
        $query = Order::query();

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (isset($filters['is_takeaway'])) {
            $query->where('is_takeaway', $filters['is_takeaway']);
        }

        return $query->count();
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
