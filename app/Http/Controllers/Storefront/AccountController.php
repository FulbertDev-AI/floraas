<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 404);

        $orders = $user->orders()
            ->withCount('items')
            ->latest('id')
            ->paginate(10)
            ->through(fn (Order $order): array => [
                'id' => $order->id,
                'reference' => $order->reference,
                'status' => $order->status,
                'status_label' => Order::STATUS_LABELS[$order->status] ?? $order->status,
                'currency' => $order->currency,
                'subtotal_minor' => $order->subtotal_minor,
                'items_count' => $order->items_count,
                'created_at' => $order->created_at->toIso8601String(),
            ]);

        return Inertia::render('Account/Index', [
            'customer' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User && $order->user_id === $user->id, 404);

        $order->load('items');

        return Inertia::render('Account/Show', [
            'order' => [
                'id' => $order->id,
                'reference' => $order->reference,
                'status' => $order->status,
                'status_label' => Order::STATUS_LABELS[$order->status] ?? $order->status,
                'payment_status_label' => Order::PAYMENT_LABELS[$order->payment_status] ?? $order->payment_status,
                'currency' => $order->currency,
                'subtotal_minor' => $order->subtotal_minor,
                'created_at' => $order->created_at->toIso8601String(),
                'items' => $order->items->map(fn ($item): array => [
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'variant_value' => $item->variant_value,
                    'quantity' => $item->quantity,
                    'unit_price_minor' => $item->unit_price_minor,
                    'currency' => $item->currency,
                ])->all(),
            ],
        ]);
    }
}
