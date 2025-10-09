<?php

namespace App\Http\Controllers;

use App\Service\SummaryService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SummaryController extends Controller
{
    protected $summaryService;

    public function __construct(SummaryService $summaryService)
    {
        $this->summaryService = $summaryService;
    }

    public function cashier() : JsonResponse
    {
        $cashier = Auth::user();

        //If get undefined method, thats just your IDE. I think :v
        $data = $cashier->orders()
            ->whereDate('created_at', Carbon::today())
            ->get();

        return response()->json([
            "success" => true,
            "message" => "Berhasil Mengambil Data",
            "data" => $data
        ], 200);
    }

    public function summary(Request $request)  : JsonResponse
    {
        $filters = $request->only(["end_date", "start_date"]);

        $data = $this->summaryService
            ->getOrder($filters);

        return response()->json([
            "success" => true,
            "message" => "Berhasil Mengambil Data",
            "data" => $data
        ], 200);
    }
}
