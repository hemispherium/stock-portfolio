<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class StockPriceService
{
    private const CACHE_TTL = 60;        // 60秒キャッシュ
    private const CACHE_PREFIX = 'stock:price:';

    public function getPrice(string $symbol): ?array
    {
        return Cache::get(self::CACHE_PREFIX . strtoupper($symbol));
    }

    public function fetchAndCache(string $symbol): array
    {
        $symbol = strtoupper($symbol);
        $data   = $this->fetchFromYahoo($symbol);

        $key = self::CACHE_PREFIX . $symbol;
        Cache::put($key, $data, self::CACHE_TTL);
        Log::info('Cache written', [
            'driver' => config('cache.default'),
            'key'    => $key,
            'symbol' => $symbol,
        ]);

        return $data;
    }

    public function getCacheKey(string $symbol): string
    {
        return self::CACHE_PREFIX . strtoupper($symbol);
    }

    public function history(string $symbol, string $range = '1mo'): array
    {
        $intervalMap = [
            '1d'  => ['interval' => '5m',  'intraday' => true],
            '5d'  => ['interval' => '15m', 'intraday' => true],
            '1mo' => ['interval' => '1d',  'intraday' => false],
            '6mo' => ['interval' => '1wk', 'intraday' => false],
            'ytd' => ['interval' => '1d',  'intraday' => false],
            '1y'  => ['interval' => '1wk', 'intraday' => false],
        ];

        if (! array_key_exists($range, $intervalMap)) {
            $range = '1mo';
        }

        $interval  = $intervalMap[$range]['interval'];
        $intraday  = $intervalMap[$range]['intraday'];

        $response = Http::withHeaders(['User-Agent' => 'Mozilla/5.0'])
            ->timeout(10)
            ->get("https://query1.finance.yahoo.com/v8/finance/chart/{$symbol}", [
                'interval' => $interval,
                'range'    => $range,
            ]);

        if (! $response->successful()) {
            return [];
        }

        $result     = $response->json('chart.result.0');
        $timestamps = $result['timestamp'] ?? [];
        $closes     = $result['indicators']['quote'][0]['close'] ?? [];
        $timezone   = $result['meta']['exchangeTimezoneName'] ?? 'America/New_York';

        $data = [];
        foreach ($timestamps as $i => $ts) {
            if (! isset($closes[$i]) || $closes[$i] === null) continue;
            $dt     = new \DateTime('@' . $ts);
            $dt->setTimezone(new \DateTimeZone($timezone));
            $label  = $intraday ? $dt->format('H:i') : $dt->format('Y-m-d');
            $data[] = [
                'date'  => $label,
                'close' => round((float) $closes[$i], 2),
            ];
        }

        return $data;
    }

    public function search(string $query): array
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0',
        ])->timeout(10)->get('https://query1.finance.yahoo.com/v1/finance/search', [
            'q'           => $query,
            'lang'        => 'en-US',
            'quotesCount' => 8,
            'newsCount'   => 0,
        ]);

        if (! $response->successful()) {
            return [];
        }

        $quotes = $response->json('quotes') ?? [];

        return collect($quotes)
            ->filter(fn($q) => isset($q['symbol'], $q['shortname']) && in_array($q['quoteType'] ?? '', ['EQUITY', 'ETF']))
            ->map(fn($q) => [
                'symbol'   => $q['symbol'],
                'name'     => $q['shortname'] ?? $q['longname'] ?? '',
                'type'     => $q['quoteType'] ?? '',
                'exchange' => $q['exchDisp'] ?? '',
            ])
            ->values()
            ->toArray();
    }

    private function fetchFromYahoo(string $symbol): array
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0',
        ])->timeout(10)->get("https://query1.finance.yahoo.com/v8/finance/chart/{$symbol}", [
            'interval' => '1d',
            'range'    => '1d',
        ]);

        if (! $response->successful()) {
            throw new RuntimeException("Yahoo Finance API error for {$symbol}: {$response->status()}");
        }

        $meta = $response->json('chart.result.0.meta')
            ?? throw new RuntimeException("Price not found in response for {$symbol}");

        $price         = (float) ($meta['regularMarketPrice'] ?? 0);
        $previousClose = (float) ($meta['chartPreviousClose'] ?? $meta['previousClose'] ?? $price);
        $change        = round($price - $previousClose, 4);
        $changePct     = $previousClose > 0 ? round(($change / $previousClose) * 100, 2) : 0;

        return [
            'price'      => $price,
            'change'     => $change,
            'change_pct' => $changePct,
            'currency'   => $meta['currency'] ?? 'USD',
        ];
    }
}
