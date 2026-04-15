<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\FetchStockPrice;
use App\Services\StockPriceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function __construct(private StockPriceService $priceService) {}

    public function price(string $symbol): JsonResponse
    {
        $symbol = strtoupper($symbol);

        // Redis キャッシュから取得
        $price = $this->priceService->getPrice($symbol);

        if ($price !== null) {
            return response()->json(array_merge(['symbol' => $symbol, 'cached' => true], $price));
        }

        // キャッシュミス → 同期取得 (初回のみ。以降は Worker が更新)
        try {
            $data = $this->priceService->fetchAndCache($symbol);

            FetchStockPrice::dispatch($symbol)->onQueue('stock_prices');

            return response()->json(array_merge(['symbol' => $symbol, 'cached' => false], $data));
        } catch (\Throwable $e) {
            return response()->json([
                'message' => "Failed to fetch price for {$symbol}",
            ], 503);
        }
    }

    public function history(Request $request, string $symbol): JsonResponse
    {
        $range = $request->query('range', '1mo');
        $data  = $this->priceService->history(strtoupper($symbol), $range);
        return response()->json($data);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->validate(['q' => 'required|string|min:1|max:50'])['q'];
        $results = $this->priceService->search($query);
        return response()->json($results);
    }

    public function prices(string $symbols): JsonResponse
    {
        $symbolList = array_map('strtoupper', explode(',', $symbols));
        $result = [];

        foreach ($symbolList as $symbol) {
            $price = $this->priceService->getPrice($symbol);

            if ($price === null) {
                FetchStockPrice::dispatch($symbol)->onQueue('stock_prices');
            }

            $result[$symbol] = $price;
        }

        return response()->json($result);
    }
}
