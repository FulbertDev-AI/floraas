<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_from_the_customer_account(): void
    {
        $this->get('/account')->assertRedirect('/login');
    }

    public function test_authenticated_customer_can_see_their_checkout_request_and_snapshot(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create([
            'price_minor' => 2599,
            'currency' => 'EUR',
            'stock_quantity' => 3,
        ]);

        $this->actingAs($user)
            ->post('/cart/items', [
                'product_id' => $product->id,
                'quantity' => 1,
            ])
            ->assertRedirect('/cart');

        $this->get('/checkout')->assertOk();
        $submissionKey = session('storefront.checkout_key');

        $this->post('/checkout', [
            'contact_name' => $user->name,
            'email' => $user->email,
            'understands_unconfirmed' => '1',
            'submission_key' => $submissionKey,
        ])->assertRedirect('/checkout/confirmation');

        $order = Order::query()->where('user_id', $user->id)->firstOrFail();
        $otherUser = User::factory()->create();
        Order::query()->create([
            'reference' => 'FLORAA-OTHER-0002',
            'submission_key' => Str::uuid()->toString(),
            'user_id' => $otherUser->id,
            'contact_name' => $otherUser->name,
            'email' => $otherUser->email,
            'status' => Order::STATUS_PENDING_CONFIGURATION,
            'payment_status' => Order::PAYMENT_NOT_STARTED,
            'currency' => 'EUR',
            'subtotal_minor' => 1000,
        ]);

        $this->get('/account')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Account/Index')
                ->where('customer.email', $user->email)
                ->where('orders.total', 1)
                ->where('orders.data.0.reference', $order->reference));

        $this->get("/account/orders/{$order->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Account/Show')
                ->where('order.reference', $order->reference)
                ->where('order.items.0.product_name', $product->name)
                ->where('order.items.0.unit_price_minor', 2599)
                ->where('order.payment_status_label', 'Non démarré'));
    }

    public function test_customer_cannot_view_another_users_order(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $order = Order::query()->create([
            'reference' => 'FLORAA-OTHER-0001',
            'submission_key' => Str::uuid()->toString(),
            'user_id' => $otherUser->id,
            'contact_name' => $otherUser->name,
            'email' => $otherUser->email,
            'status' => Order::STATUS_PENDING_CONFIGURATION,
            'payment_status' => Order::PAYMENT_NOT_STARTED,
            'currency' => 'EUR',
            'subtotal_minor' => 1000,
        ]);

        $this->actingAs($user)
            ->get("/account/orders/{$order->id}")
            ->assertNotFound();
    }
}
