<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\DemoCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class DemoCatalogSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_catalog_seeder_is_explicit_and_idempotent(): void
    {
        Artisan::call('db:seed', ['--class' => DemoCatalogSeeder::class, '--no-interaction' => true]);
        Artisan::call('db:seed', ['--class' => DemoCatalogSeeder::class, '--no-interaction' => true]);

        $this->assertDatabaseCount('categories', 2);
        $this->assertDatabaseCount('products', 4);
        $this->assertSame(4, Product::query()->where('currency', 'XXX')->count());
        $this->assertSame(4, Product::query()->where('name', 'like', 'DÉMO — %')->count());
        $this->assertSame(2, Category::query()->where('name', 'like', 'DÉMO — %')->count());
    }

    public function test_default_database_seeder_does_not_create_a_public_test_account(): void
    {
        Artisan::call('db:seed', ['--no-interaction' => true]);

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('products', 0);
    }
}
