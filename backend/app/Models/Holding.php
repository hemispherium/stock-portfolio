<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Holding extends Model
{
    protected $fillable = ['portfolio_id', 'symbol', 'quantity', 'avg_cost'];

    protected $casts = [
        'quantity' => 'float',
        'avg_cost' => 'float',
    ];

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }
}
