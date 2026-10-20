<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'published_products' => Product::query()->published()->count(),
                'draft_products' => Product::query()->where('is_published', false)->count(),
                'out_of_stock_products' => Product::query()->where('stock_quantity', 0)->count(),
                'pending_order_requests' => Order::query()
                    ->where('status', Order::STATUS_PENDING_CONFIGURATION)
                    ->count(),
            ],
        ]);
    }
}
