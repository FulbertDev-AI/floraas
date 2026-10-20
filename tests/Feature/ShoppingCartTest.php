<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ShoppingCartTest extends TestCase
{
    use RefreshDatabase;

    public function test_cart_calculates_prices_from_the_database(): void
    {
        $product = Product::factory()->create([
            'price_minor' => 2500,
            'stock_quantity' => 5,
            'currency' => 'EUR',
        ]);

        $this->post('/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'price_minor' => 1,
        ])->assertRedirect('/cart');

        $this->get('/cart')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Cart')
                ->where('cart.item_count', 2)
                ->where('cart.subtotal_minor', 5000)
                ->where('cart.currency', 'EUR')
                ->where('cart.can_checkout', true));
    }

    public function test_cart_refuses_quantities_above_current_stock(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 3]);

        $response = $this->from('/products/'.$product->slug)
            ->post('/cart/items', [
                'product_id' => $product->id,
                'quantity' => 4,
            ])
            ->assertSessionHasErrors('quantity');

        $response->assertSessionMissing('storefront.cart');
    }

    public function test_variant_products_require_a_valid_in_stock_variant(): void
    {
        $product = Product::factory()->create(['stock_quantity' => 0]);
        $variant = $product->variants()->create([
            'option_name' => 'Nuance',
            'option_value' => 'Ambre',
            'sku' => 'FL-AMB-01',
            'price_minor' => 3000,
            'stock_quantity' => 2,
            'is_available' => true,
            'sort_order' => 0,
        ]);

        $this->from('/products/'.$product->slug)
            ->post('/cart/items', [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertSessionHasErrors('variant_id');

        $this->post('/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 3,
        ])->assertSessionHasErrors('quantity');

        $this->post('/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 2,
        ])->assertRedirect('/cart');

        $this->get('/cart')
            ->assertInertia(fn (Assert $page) => $page
                ->where('cart.subtotal_minor', 6000)
                ->where('cart.item_count', 2));
    }

    public function test_checkout_shows_the_unconfirmed_request_form_when_the_cart_is_ready(): void
    {
        $product = Product::factory()->create([
            'name' => 'Produit de soin',
            'price_minor' => 1500,
            'currency' => 'EUR',
            'stock_quantity' => 2,
        ]);

        $this->post('/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertRedirect('/cart');

        $this->get('/checkout')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Checkout')
                ->where('cart.item_count', 1)
                ->where('cart.can_checkout', true)
                ->has('submissionKey'));
    }

    public function test_checkout_requests_are_recorded_as_pending_configuration_and_not_paid(): void
    {
        $product = Product::factory()->create([
            'name' => 'Produit de soin',
            'price_minor' => 1500,
            'currency' => 'EUR',
            'stock_quantity' => 2,
        ]);

        $this->post('/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertRedirect('/cart');

        $this->get('/checkout')->assertOk();
        $submissionKey = session('storefront.checkout_key');
        $this->assertIsString($submissionKey);

        $this->post('/checkout', [
            'contact_name' => 'Claire Martin',
            'email' => 'claire@example.com',
            'phone' => '0612345678',
            'understands_unconfirmed' => '1',
            'submission_key' => $submissionKey,
        ])->assertRedirect('/checkout/confirmation');

        $this->assertDatabaseHas('orders', [
            'contact_name' => 'Claire Martin',
            'status' => 'pending_configuration',
            'payment_status' => 'not_started',
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price_minor' => 1500,
            'quantity' => 1,
        ]);

        $product->update(['name' => 'Prix et nom modifiés', 'price_minor' => 3000]);

        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'product_name' => 'Produit de soin',
            'unit_price_minor' => 1500,
        ]);
    }

    public function test_reposting_a_checkout_submission_does_not_create_duplicate_order_items(): void
    {
        $product = Product::factory()->create([
            'price_minor' => 1500,
            'currency' => 'EUR',
            'stock_quantity' => 2,
        ]);

        $this->post('/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertRedirect('/cart');

        $this->get('/checkout')->assertOk();
        $payload = [
            'contact_name' => 'Claire Martin',
            'email' => 'claire@example.com',
            'understands_unconfirmed' => '1',
            'submission_key' => session('storefront.checkout_key'),
        ];

        $this->post('/checkout', $payload)->assertRedirect('/checkout/confirmation');
        $this->post('/checkout', $payload)->assertRedirect('/checkout/confirmation');

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }
}
