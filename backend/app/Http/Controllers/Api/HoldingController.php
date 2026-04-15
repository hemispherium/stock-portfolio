<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\Holding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HoldingController extends Controller
{
    public function store(Request $request, Portfolio $portfolio): JsonResponse
    {
        abort_if($portfolio->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'symbol'   => 'required|string|max:20|uppercase',
            'quantity' => 'required|numeric|min:0.0001',
            'avg_cost' => 'required|numeric|min:0',
        ]);

        $holding = $portfolio->holdings()->create($validated);

        return response()->json($holding, 201);
    }

    public function update(Request $request, Portfolio $portfolio, Holding $holding): JsonResponse
    {
        abort_if($portfolio->user_id !== $request->user()->id, 403);
        abort_if($holding->portfolio_id !== $portfolio->id, 404);

        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0.0001',
            'avg_cost' => 'required|numeric|min:0',
        ]);

        $holding->update($validated);

        return response()->json($holding);
    }

    public function destroy(Request $request, Portfolio $portfolio, Holding $holding): JsonResponse
    {
        abort_if($portfolio->user_id !== $request->user()->id, 403);
        abort_if($holding->portfolio_id !== $portfolio->id, 404);

        $holding->delete();

        return response()->json(null, 204);
    }
}
