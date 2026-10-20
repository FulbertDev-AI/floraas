<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateOrderRequest
{
    /**
     * @param  array{contact_name: string, email: string, phone?: ?string}  $contact
     * @param  array<int, array{product_id: int, variant_id: ?int, quantity: int}>  $lines
     */
    public function handle(array $contact, array $lines, ?User $user, string $submissionKey): Order
    {
        try {
            return DB::transaction(function () use ($contact, $lines, $user, $submissionKey): Order {
                $existingOrder = Order::query()->where('submission_key', $submissionKey)->first();

                if ($existingOrder !== null) {
                    if ($existingOrder->user_id !== $user?->id || $existingOrder->email !== $contact['email']) {
                        throw ValidationException::withMessages([
                            'submission_key' => 'Cette demande a déjà été envoyée avec d’autres coordonnées.',
                        ]);
                    }

                    return $existingOrder;
                }

                if ($lines === []) {
                    throw ValidationException::withMessages([
                        'cart' => 'Votre panier est vide.',
                    ]);
                }

                $productIds = array_values(array_unique(array_column($lines, 'product_id')));
                $products = Product::query()
                    ->published()
                    ->whereKey($productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');
                $variants = ProductVariant::query()
                    ->whereIn('product_id', $productIds)
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');
                $preparedItems = [];
                $currency = null;
                $subtotal = 0;

                foreach ($lines as $line) {
                    $product = $products->get($line['product_id']);

                    if (! $product) {
                        throw ValidationException::withMessages([
                            'cart' => 'Un produit du panier n’est plus disponible.',
                        ]);
                    }

                    $productVariants = $variants->where('product_id', $product->id);
                    $variant = $line['variant_id'] === null
                        ? null
                        : $variants->get($line['variant_id']);

                    if (
                        ($productVariants->isNotEmpty() && $variant === null)
                        || ($variant !== null && ($variant->product_id !== $product->id || ! $variant->is_available))
                    ) {
                        throw ValidationException::withMessages([
                            'cart' => 'Une option du panier n’est plus disponible.',
                        ]);
                    }

                    $unitPrice = $variant?->price_minor ?? $product->price_minor;
                    $lineCurrency = $product->currency;
                    $stock = $variant?->stock_quantity ?? $product->stock_quantity;

                    if ($unitPrice === null || ! is_string($lineCurrency) || ! preg_match('/^[A-Z]{3}$/D', $lineCurrency)) {
                        throw ValidationException::withMessages([
                            'cart' => 'Le prix ou la devise d’un produit doit être vérifié par la boutique.',
                        ]);
                    }

                    if ($stock < $line['quantity']) {
                        throw ValidationException::withMessages([
                            'cart' => 'Le stock a changé. Vérifiez les quantités de votre panier.',
                        ]);
                    }

                    if ($currency !== null && $currency !== $lineCurrency) {
                        throw ValidationException::withMessages([
                            'cart' => 'Une demande ne peut contenir que des produits dans la même devise.',
                        ]);
                    }

                    $currency = $lineCurrency;
                    $subtotal += $unitPrice * $line['quantity'];
                    $preparedItems[] = [
                        'product_id' => $product->id,
                        'variant_id' => $variant?->id,
                        'product_name' => $product->name,
                        'sku' => $variant?->sku ?? $product->sku,
                        'variant_name' => $variant?->option_name,
                        'variant_value' => $variant?->option_value,
                        'quantity' => $line['quantity'],
                        'unit_price_minor' => $unitPrice,
                        'currency' => $lineCurrency,
                    ];
                }

                $order = Order::query()->create([
                    'reference' => Str::upper((string) Str::ulid()),
                    'submission_key' => $submissionKey,
                    'user_id' => $user?->id,
                    'contact_name' => $contact['contact_name'],
                    'email' => $contact['email'],
                    'phone' => $contact['phone'] ?? null,
                    'status' => Order::STATUS_PENDING_CONFIGURATION,
                    'payment_status' => Order::PAYMENT_NOT_STARTED,
                    'currency' => $currency,
                    'subtotal_minor' => $subtotal,
                    'shipping_minor' => null,
                    'total_minor' => null,
                ]);

                $order->items()->createMany($preparedItems);

                return $order;
            });
        } catch (QueryException $exception) {
            $existingOrder = Order::query()->where('submission_key', $submissionKey)->first();

            if ($existingOrder === null) {
                throw $exception;
            }

            if ($existingOrder->user_id !== $user?->id || $existingOrder->email !== $contact['email']) {
                throw ValidationException::withMessages([
                    'submission_key' => 'Cette demande a déjà été envoyée avec d’autres coordonnées.',
                ]);
            }

            return $existingOrder;
        }
    }
}
