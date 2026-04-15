<?php

use App\Http\Controllers\Api\HoldingController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\StockController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// 認証エンドポイント
Route::post('/register', function (Request $request) {
    $validated = $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'required|email|unique:users',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = \App\Models\User::create([
        'name'     => $validated['name'],
        'email'    => $validated['email'],
        'password' => bcrypt($validated['password']),
    ]);

    $token = $user->createToken('api')->plainTextToken;

    return response()->json(['token' => $token], 201);
});

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email'    => 'required|email',
        'password' => 'required|string',
    ]);

    if (! auth()->attempt($credentials)) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    $token = auth()->user()->createToken('api')->plainTextToken;

    return response()->json(['token' => $token]);
});

// 認証が必要なエンドポイント
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(null, 204);
    });

    // 株価取得 (Redis キャッシュ → Worker)
    Route::get('stocks/search', [StockController::class, 'search']);
    Route::get('stocks/{symbol}/history', [StockController::class, 'history']);
    Route::get('stocks/{symbol}/price', [StockController::class, 'price']);
    Route::get('stocks/prices/{symbols}', [StockController::class, 'prices']);

    // ポートフォリオ CRUD
    Route::apiResource('portfolios', PortfolioController::class);

    // 保有銘柄 CRUD (portfolios のネストリソース)
    Route::post('portfolios/{portfolio}/holdings', [HoldingController::class, 'store']);
    Route::put('portfolios/{portfolio}/holdings/{holding}', [HoldingController::class, 'update']);
    Route::delete('portfolios/{portfolio}/holdings/{holding}', [HoldingController::class, 'destroy']);
});
