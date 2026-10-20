<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Contracts\Session\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CartService
{
    private const SESSION_KEY = 'storefront.cart';

    public function __construct(private readonly Session $session) {}

    public function add(int $productId, ?int $variantId, int $quantity): void
    {
        $line = DB::transaction(function () use ($productId, $variantId, $quantity): array {
            $product = Product::query()->published()->lockForUpdate()->findOrFail($productId);
            $hasVariants = ProductVariant::query()->where('product_id', $product->id)->exists();

            if ($hasVariants && $variantId === null) {
                throw ValidationException::withMessages([
                    'variant_id' => 'Choisissez une option avant d’ajouter ce produit au panier.',
                ]);
            }

            if (! $hasVariants && $variantId !== null) {
                throw ValidationException::withMessages([
                    'variant_id' => 'Cette option ne correspond pas au produit sélectionné.',
                ]);
            }

            $variant = $variantId === null
                ? null
                : ProductVariant::query()
                    ->where('product_id', $product->id)
                    ->where('is_available', true)
                    ->lockForUpdate()
                    ->findOrFail($variantId);

            $stock = $variant?->stock_quantity ?? $product->stock_quantity;
            $key = $this->lineKey($product->id, $variant?->id);
            $cart = $this->cart();
            $newQuantity = ($cart[$key]['quantity'] ?? 0) + $quantity;

            if ($stock < 1 || $newQuantity > $stock) {
                throw ValidationException::withMessages([
                    'quantity' => 'La quantité demandée dépasse le stock disponible.',
                ]);
            }

            return [
                'key' => $key,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'quantity' => $newQuantity,
            ];
        });

        $cart = $this->cart();
        $cart[$line['key']] = $line;
        $this->session->put(self::SESSION_KEY, $cart);
    }

    public function setQuantity(int $productId, ?int $variantId, int $quantity): void
    {
        $product = Product::query()->published()->with('variants')->findOrFail($productId);
        $variant = $variantId === null
            ? null
            : $product->variants->firstWhere('id', $variantId);

        if ($variantId !== null && (! $variant || ! $variant->is_available)) {
            throw ValidationException::withMessages([
                'variant_id' => 'Cette option n’est plus disponible.',
            ]);
        }

        if ($variant === null && $product->variants->isNotEmpty()) {
            throw ValidationException::withMessages([
                'variant_id' => 'Choisissez une option disponible.',
            ]);
        }

        $stock = $variant?->stock_quantity ?? $product->stock_quantity;

        if ($quantity > $stock) {
            throw ValidationException::withMessages([
                'quantity' => 'La quantité demandée dépasse le stock disponible.',
            ]);
        }

        $cart = $this->cart();
        $key = $this->lineKey($productId, $variantId);

        if (! isset($cart[$key])) {
            throw ValidationException::withMessages([
                'cart' => 'Cet article ne se trouve plus dans le panier.',
            ]);
        }

        $cart[$key]['quantity'] = $quantity;
        $this->session->put(self::SESSION_KEY, $cart);
    }

    public function remove(int $productId, ?int $variantId): void
    {
        $cart = $this->cart();
        unset($cart[$this->lineKey($productId, $variantId)]);
        $this->session->put(self::SESSION_KEY, $cart);
    }

    /**
     * @return array<int, array{product_id: int, variant_id: ?int, quantity: int}>
     */
    public function checkoutLines(): array
    {
        $lines = array_values($this->cart());

        if ($lines === []) {
            throw ValidationException::withMessages([
                'cart' => 'Votre panier est vide.',
            ]);
        }

        return $lines;
    }

    public function clear(): void
    {
        $this->session->forget(self::SESSION_KEY);
    }

    /**
     * @return array{
     *   items: array<int, array<string, mixed>>,
     *   item_count: int,
     *   currency: ?string,
     *   subtotal_minor: ?int,
     *   can_checkout: bool
     * }
     */
    public function contents(): array
    {
        $cart = $this->cart();

        if ($cart === []) {
            return [
                'items' => [],
                'item_count' => 0,
                'currency' => null,
                'subtotal_minor' => 0,
                'can_checkout' => false,
            ];
        }

        $productIds = array_values(array_unique(array_column($cart, 'product_id')));
        $products = Product::query()
            ->withTrashed()
            ->with(['primaryImage', 'variants'])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');
        $currencies = [];
        $items = [];
        $allAvailable = true;
        $itemCount = 0;
        $subtotal = 0;

        foreach ($cart as $key => $line) {
            $itemCount += $line['quantity'];
            $product = $products->get($line['product_id']);
            $variant = $product && $line['variant_id'] !== null
                ? $product->variants->firstWhere('id', $line['variant_id'])
                : null;
            $isAvailable = $product !== null
                && $product->trashed() === false
                && $product->is_published
                && $product->published_at !== null
                && $product->published_at->isPast()
                && ($line['variant_id'] === null || ($variant !== null && $variant->is_available));
            $unitPrice = $variant?->price_minor ?? $product?->price_minor;
            $currency = $product?->currency;
            $stock = $variant?->stock_quantity ?? $product?->stock_quantity;
            $isAvailable = $isAvailable
                && $unitPrice !== null
                && $currency !== null
                && $stock !== null
                && $line['quantity'] <= $stock;

            if ($isAvailable) {
                $currencies[$currency] = true;
                $subtotal += $unitPrice * $line['quantity'];
            } else {
                $allAvailable = false;
            }

            $image = $product?->primaryImage;
            $items[] = [
                'key' => $key,
                'product_id' => $line['product_id'],
                'variant_id' => $line['variant_id'],
                'quantity' => $line['quantity'],
                'name' => $product?->name ?? 'Produit indisponible',
                'variant_name' => $variant?->option_name,
                'variant_value' => $variant?->option_value,
                'unit_price_minor' => $unitPrice,
                'line_total_minor' => $unitPrice === null ? null : $unitPrice * $line['quantity'],
                'currency' => $currency,
                'stock_quantity' => $stock,
                'is_available' => $isAvailable,
                'image_url' => $image ? Storage::disk('public')->url($image->path) : null,
            ];
        }

        $oneCurrency = count($currencies) === 1;

        return [
            'items' => $items,
            'item_count' => $itemCount,
            'currency' => $oneCurrency ? array_key_first($currencies) : null,
            'subtotal_minor' => $allAvailable && $oneCurrency ? $subtotal : null,
            'can_checkout' => $allAvailable && $oneCurrency && $itemCount > 0,
        ];
    }

    /**
     * @return array<string, array{product_id: int, variant_id: ?int, quantity: int}>
     */
    private function cart(): array
    {
        $cart = $this->session->get(self::SESSION_KEY, []);

        if (! is_array($cart)) {
            throw new \UnexpectedValueException('Le panier de la session est invalide.');
        }

        return $cart;
    }

    private function lineKey(int $productId, ?int $variantId): string
    {
        return $productId.':'.($variantId ?? 0);
    }
}
