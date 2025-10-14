<?php

namespace App\Service;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SummaryService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

        public function getOrder(array $filters)
    {
        if (
            (!empty($filters["start_date"]) && empty($filters["end_date"])) ||
            (empty($filters["start_date"]) && !empty($filters["end_date"]))
        ) {
            throw ValidationException::withMessages([
                'date' => 'Harap isi keduanya: start_date dan end_date',
            ]);
        }

        $start = !empty($filters['start_date'])
            ? Carbon::createFromFormat('Y-m-d', $filters['start_date'])->startOfDay()
            : now()->subDays(7)->startOfDay();

        $end = !empty($filters['end_date'])
            ? Carbon::createFromFormat('Y-m-d', $filters['end_date'])->endOfDay()
            : now()->endOfDay();

        $orders = Order::query()
            ->select(['id', 'is_takeaway', 'payment_method', 'total'])
            ->whereBetween('created_at', [$start, $end])
            ->get();

        if ($orders->isEmpty()) {
            return [
                'total_items' => [],
                'total_based_on_product_category' => [],
                'total_based_on_payment_method' => [],
                'total_based_on_customer_preferences' => [
                    'takeaway' => 0,
                    'dine_in' => 0,
                ],
                'total_income' => 0,
                'total_order' => 0,
            ];
        }

        $orderIds = $orders->pluck('id');

        $productStats = OrderItem::query()
            ->select([
                'products.category',
                'products.name',
                DB::raw('SUM(order_items.quantity) as total_qty')
            ])
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->whereIn('order_items.order_id', $orderIds)
            ->groupBy('products.category', 'products.name')
            ->get();

        $summary = [
            'total_items' => [],
            'total_based_on_product_category' => [],
            'total_based_on_payment_method' => [],
            'total_based_on_customer_preferences' => [
                'takeaway' => 0,
                'dine_in' => 0,
            ],
            'total_income' => $orders->sum('total'),
            'total_order' => $orders->count(),
        ];

        foreach ($orders as $order) {
            $summary['total_based_on_customer_preferences'][
                $order->is_takeaway ? 'takeaway' : 'dine_in'
            ]++;
        }

        $summary['total_based_on_payment_method'] = $orders
            ->groupBy(fn($order) => strtolower($order->payment_method))
            ->map(fn($group) => $group->count())
            ->toArray();

        foreach ($productStats as $stat) {
            $category = strtolower($stat->category);
            $product = $stat->name;
            $qty = (int) $stat->total_qty;

            if (!isset($summary['total_items'][$category])) {
                $summary['total_items'][$category] = [];
                $summary['total_based_on_product_category'][$category] = 0;
            }

            $summary['total_items'][$category][$product] = $qty;
            $summary['total_based_on_product_category'][$category] += $qty;
        }

        $summary['total_items']['total_item'] = collect($summary['total_items'])
            ->map(fn($items) => collect($items)->sum())
            ->sum();

        return $summary;
    }

}
