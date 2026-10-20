<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(CartService $cart): Response
    {
        return Inertia::render('Shop/Cart', [
            'cart' => $cart->contents(),
        ]);
    }

    public function store(Request $request, CartService $cart): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'min:1'],
            'variant_id' => ['nullable', 'integer', 'min:1'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $cart->add($data['product_id'], $data['variant_id'] ?? null, $data['quantity']);

        return redirect()->route('cart.index')->with('success', 'Produit ajouté au panier.');
    }

    public function update(Request $request, int $product, CartService $cart): RedirectResponse
    {
        $data = $request->validate([
            'variant_id' => ['nullable', 'integer', 'min:1'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ]);

        $cart->setQuantity($product, $data['variant_id'] ?? null, $data['quantity']);

        return redirect()->route('cart.index')->with('success', 'Quantité mise à jour.');
    }

    public function destroy(Request $request, int $product, CartService $cart): RedirectResponse
    {
        $data = $request->validate([
            'variant_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $cart->remove($product, $data['variant_id'] ?? null);

        return redirect()->route('cart.index')->with('success', 'Article supprimé du panier.');
    }
}
