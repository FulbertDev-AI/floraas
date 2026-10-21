<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_each_existing_management_section(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        foreach ([
            '/admin',
            '/admin/products',
            '/admin/products/create',
            '/admin/categories',
            '/admin/categories/create',
            '/admin/collections',
            '/admin/collections/create',
            '/admin/orders',
            '/admin/settings',
        ] as $path) {
            $this->actingAs($admin)->get($path)->assertOk();
        }
    }

    public function test_admin_can_open_dashboard_with_live_catalog_metrics(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        Product::factory()->create(['is_published' => true, 'stock_quantity' => 2]);
        Product::factory()->create(['is_published' => false, 'stock_quantity' => 0]);
        Category::factory()->count(2)->create();
        Order::query()->create([
            'reference' => 'FLORAATESTORDER00000000001',
            'submission_key' => fake()->uuid(),
            'contact_name' => 'Client Test',
            'email' => 'client@example.test',
            'status' => Order::STATUS_PENDING_CONFIGURATION,
            'payment_status' => Order::PAYMENT_NOT_STARTED,
            'currency' => 'EUR',
            'subtotal_minor' => 2500,
        ]);

        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('metrics.published_products', 1)
                ->where('metrics.draft_products', 1)
                ->where('metrics.out_of_stock_products', 1)
                ->where('metrics.categories', 2)
                ->where('metrics.pending_order_requests', 1));
    }
}
