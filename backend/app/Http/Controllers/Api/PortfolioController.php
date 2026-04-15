<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $portfolios = $request->user()
            ->portfolios()
            ->with('holdings')
            ->get();

        return response()->json($portfolios);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $portfolio = $request->user()->portfolios()->create($validated);

        return response()->json($portfolio, 201);
    }

    public function show(Request $request, Portfolio $portfolio): JsonResponse
    {
        abort_if($portfolio->user_id !== $request->user()->id, 403);

        return response()->json($portfolio->load('holdings'));
    }

    public function update(Request $request, Portfolio $portfolio): JsonResponse
    {
        abort_if($portfolio->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $portfolio->update($validated);

        return response()->json($portfolio);
    }

    public function destroy(Request $request, Portfolio $portfolio): JsonResponse
    {
        abort_if($portfolio->user_id !== $request->user()->id, 403);

        $portfolio->delete();

        return response()->json(null, 204);
    }
}
