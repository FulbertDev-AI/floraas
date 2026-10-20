<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCheckoutRequest;
use App\Models\Order;
use App\Services\CartService;
use App\Services\CreateOrderRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(Request $request, CartService $cart): Response|RedirectResponse
    {
        $contents = $cart->contents();

        if ($contents['items'] === []) {
            return redirect()->route('cart.index');
        }

        return Inertia::render('Shop/Checkout', [
            'cart' => $contents,
            'submissionKey' => $request->session()->get('storefront.checkout_key')
                ?? tap(Str::uuid()->toString(), fn (string $key) => $request->session()->put('storefront.checkout_key', $key)),
        ]);
    }

    public function store(
        StoreCheckoutRequest $request,
        CartService $cart,
        CreateOrderRequest $createOrderRequest,
    ): RedirectResponse {
        $submissionKey = $request->validated('submission_key');
        $lines = Order::query()->where('submission_key', $submissionKey)->exists()
            ? []
            : $cart->checkoutLines();

        $order = $createOrderRequest->handle(
            $request->safe()->only(['contact_name', 'email', 'phone']),
            $lines,
            $request->user(),
            $submissionKey,
        );

        $cart->clear();
        $request->session()->put('storefront.last_order_id', $order->id);
        $request->session()->put('storefront.checkout_key', Str::uuid()->toString());

        return redirect()->route('checkout.confirmation')
            ->with('success', 'Votre demande a été transmise. Elle ne constitue pas encore une commande confirmée.');
    }

    public function confirmation(Request $request): Response
    {
        $orderId = $request->session()->get('storefront.last_order_id');

        abort_unless(is_int($orderId), 404);

        $orderQuery = Order::query()->with('items')->whereKey($orderId);
        $user = $request->user();

        $orderQuery->when(
            $user,
            fn ($query) => $query->where('user_id', $user->id),
            fn ($query) => $query->whereNull('user_id'),
        );

        $order = $orderQuery->firstOrFail();

        return Inertia::render('Shop/OrderRequestConfirmation', [
            'order' => [
                'reference' => $order->reference,
                'contact_name' => $order->contact_name,
                'status' => $order->status,
                'currency' => $order->currency,
                'subtotal_minor' => $order->subtotal_minor,
                'items' => $order->items->map(fn ($item): array => [
                    'product_name' => $item->product_name,
                    'variant_value' => $item->variant_value,
                    'quantity' => $item->quantity,
                    'unit_price_minor' => $item->unit_price_minor,
                    'currency' => $item->currency,
                ])->all(),
            ],
        ]);
    }
}
