<?php

namespace App\Http\Controllers;

use App\Http\Requests\Order\CreateOrder;
use App\Service\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Exception;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Get order analytics with count (for manager dashboard charts)
     * Example: /api/orders?is_takeaway=false&payment_method=qris
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['user_id', 'payment_method', 'is_takeaway']);
            $count = $this->orderService->getOrderCount($filters);

            return response()->json([
                'success' => true,
                'message' => 'Order analytics retrieved successfully',
                'data' => [
                    'count' => $count,
                    'filters' => $filters
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve order analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created order (for cashier)
     */
    public function store(CreateOrder $request): JsonResponse
    {
        try {
            $userId = Auth::id(); // ID cashier yang membuat order
            $order = $this->orderService->create($request->validated(), $userId);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred',
                'error' => 'Failed to save order to database'
            ], 500);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
