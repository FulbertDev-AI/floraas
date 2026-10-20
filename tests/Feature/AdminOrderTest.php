<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_cannot_view_order_requests_in_admin(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get('/admin/orders')
            ->assertForbidden();
    }

    public function test_admin_can_consult_request_and_mark_customer_contacted_without_marking_payment_paid(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $order = $this->createOrder();

        $this->actingAs($admin)
            ->get('/admin/orders/'.$order->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Orders/Show')
                ->where('order.reference', $order->reference)
                ->where('order.payment_status', 'not_started')
                ->has('order.items', 1)
                ->where('order.allowed_transitions.0', 'contacted'));

        $this->patch('/admin/orders/'.$order->id, ['status' => 'contacted'])
            ->assertRedirect('/admin/orders/'.$order->id);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => Order::STATUS_CONTACTED,
            'payment_status' => Order::PAYMENT_NOT_STARTED,
        ]);
    }

    public function test_admin_cannot_set_an_unverified_paid_status(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $order = $this->createOrder();

        $this->actingAs($admin)
            ->patch('/admin/orders/'.$order->id, ['status' => 'paid'])
            ->assertSessionHasErrors('status');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => Order::STATUS_PENDING_CONFIGURATION,
            'payment_status' => Order::PAYMENT_NOT_STARTED,
        ]);
    }

    public function test_cancelled_request_cannot_be_reopened(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $order = $this->createOrder(['status' => Order::STATUS_CANCELLED]);

        $this->actingAs($admin)
            ->patch('/admin/orders/'.$order->id, ['status' => 'contacted'])
            ->assertSessionHasErrors('status');

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => Order::STATUS_CANCELLED,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createOrder(array $attributes = []): Order
    {
        $order = Order::query()->create([
            'reference' => Str::upper((string) Str::ulid()),
            'submission_key' => fake()->uuid(),
            'contact_name' => 'Client Test',
            'email' => 'client@example.test',
            'status' => Order::STATUS_PENDING_CONFIGURATION,
            'payment_status' => Order::PAYMENT_NOT_STARTED,
            'currency' => 'EUR',
            'subtotal_minor' => 2500,
            ...$attributes,
        ]);

        $order->items()->create([
            'product_name' => 'Produit test',
            'quantity' => 1,
            'unit_price_minor' => 2500,
            'currency' => 'EUR',
        ]);

        return $order;
    }
}
