<?php

namespace App\Jobs;

use App\Services\StockPriceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class FetchStockPrice implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(public readonly string $symbol) {}

    public function handle(StockPriceService $service): void
    {
        $data = $service->fetchAndCache($this->symbol);

        Log::info("Stock price fetched", array_merge(['symbol' => $this->symbol], $data));
    }

    public function failed(\Throwable $e): void
    {
        Log::error("Failed to fetch stock price", [
            'symbol' => $this->symbol,
            'error'  => $e->getMessage(),
        ]);
    }
}
