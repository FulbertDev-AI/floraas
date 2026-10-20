<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::query()
            ->withCount('items')
            ->latest('id')
            ->paginate(20)
            ->through(fn (Order $order): array => [
                'id' => $order->id,
                'reference' => $order->reference,
                'contact_name' => $order->contact_name,
                'email' => $order->email,
                'status' => $order->status,
                'status_label' => Order::STATUS_LABELS[$order->status] ?? $order->status,
                'payment_status' => $order->payment_status,
                'payment_status_label' => Order::PAYMENT_LABELS[$order->payment_status] ?? $order->payment_status,
                'currency' => $order->currency,
                'subtotal_minor' => $order->subtotal_minor,
                'items_count' => $order->items_count,
                'created_at' => $order->created_at->toDateTimeString(),
            ]);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load('items');

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'reference' => $order->reference,
                'contact_name' => $order->contact_name,
                'email' => $order->email,
                'phone' => $order->phone,
                'status' => $order->status,
                'status_label' => Order::STATUS_LABELS[$order->status] ?? $order->status,
                'payment_status' => $order->payment_status,
                'payment_status_label' => Order::PAYMENT_LABELS[$order->payment_status] ?? $order->payment_status,
                'currency' => $order->currency,
                'subtotal_minor' => $order->subtotal_minor,
                'created_at' => $order->created_at->toDateTimeString(),
                'items' => $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'sku' => $item->sku,
                    'variant_name' => $item->variant_name,
                    'variant_value' => $item->variant_value,
                    'quantity' => $item->quantity,
                    'unit_price_minor' => $item->unit_price_minor,
                    'currency' => $item->currency,
                ])->all(),
                'allowed_transitions' => array_values(array_filter(
                    [Order::STATUS_CONTACTED, Order::STATUS_CANCELLED],
                    fn (string $status): bool => $order->canTransitionTo($status),
                )),
            ],
        ]);
    }

    public function update(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        DB::transaction(function () use ($request, $order): void {
            $lockedOrder = Order::query()->lockForUpdate()->findOrFail($order->id);
            $status = $request->validated('status');

            if (! $lockedOrder->canTransitionTo($status)) {
                throw ValidationException::withMessages([
                    'status' => 'Cette transition de statut n’est pas autorisée.',
                ]);
            }

            $lockedOrder->status = $status;
            $lockedOrder->save();
        });

        return redirect()->route('admin.orders.show', $order)
            ->with('success', 'Le statut de la demande a été mis à jour.');
    }
}
