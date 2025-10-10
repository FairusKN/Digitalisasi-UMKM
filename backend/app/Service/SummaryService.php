<?php

namespace App\Service;

use App\Models\Order;
use Carbon\Carbon;
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
            (!empty($filters["start_date"]) || !empty($filters["end_date"]))
        ) {
            throw new ValidationException(
                __("Pilih salah satu: period atau custom date")
            );
        }

        $query = Order::query();

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereBetween('created_at', [
                Carbon::parse($filters['start_date'])->startOfDay(),
                Carbon::parse($filters['end_date'])->endOfDay(),
            ]);
        } else {
            $query->whereDate('created_at', Carbon::today());
        }

        $orders = $query->with('items.product')->get();

        $summary = [
            'total_items' => [],
            'total_based_on_product_category' => [],
            'total_based_on_payment_method' => [],
            'total_based_on_customer_preferences' => [
                'takeaway' => 0,
                'dine_in' => 0,
            ],
            "total_income" => 0,
            'total_order' => $orders->count(),
        ];

        foreach ($orders as $order) {
            // Take Away VS Dine In
            $summary['total_based_on_customer_preferences'][
                $order->is_takeaway ? 'takeaway' : 'dine_in'
            ]++;
            $summary["total_income"] += $order->total;

            // Payment Method
            $paymentMethod = strtolower($order->payment_method);
            $summary['total_based_on_payment_method'][$paymentMethod] =
                ($summary['total_based_on_payment_method'][$paymentMethod] ?? 0) + 1;

            foreach ($order->items as $item) {
                $product = $item->product;
                if (!$product) continue;

                $category = strtolower($product->category);
                $productName = $product->name;
                $qty = $item->quantity;

                if (!isset($summary['total_items'][$category])) {
                    $summary['total_items'][$category] = [];
                    $summary['total_based_on_product_category'][$category] = 0;
                }

                $summary['total_items'][$category][$productName] =
                    ($summary['total_items'][$category][$productName] ?? 0) + $qty;

                $summary['total_based_on_product_category'][$category] += $qty;
            }
        }

        $summary['total_items']['total_item'] = collect($summary['total_items'])
            ->flatten()
            ->filter(fn($v) => is_numeric($v))
            ->sum();

        return $summary;
    }
}
