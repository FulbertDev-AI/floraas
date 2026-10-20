<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StorefrontCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_uses_only_published_featured_products_and_categories(): void
    {
        $category = Category::factory()->create(['is_published' => true]);
        $featuredProduct = Product::factory()->create(['is_featured' => true]);
        $featuredProduct->categories()->attach($category);
        Product::factory()->create(['is_published' => false, 'is_featured' => true]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->has('categories', 1)
                ->where('categories.0.slug', $category->slug)
                ->has('featuredProducts', 1)
                ->where('featuredProducts.0.slug', $featuredProduct->slug)
                ->has('newProducts', 0));
    }

    public function test_search_and_sort_return_published_products(): void
    {
        $match = Product::factory()->create([
            'name' => 'Sérum Floraa',
            'price_minor' => 1200,
        ]);
        Product::factory()->create([
            'name' => 'Crème Nuit',
            'price_minor' => 900,
        ]);
        Product::factory()->create([
            'name' => 'Sérum non publié',
            'is_published' => false,
        ]);

        $this->get('/shop?q=Sérum&sort=price_desc')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Index')
                ->where('products.total', 1)
                ->where('products.data.0.slug', $match->slug)
                ->where('filters.q', 'Sérum')
                ->where('filters.sort', 'price_desc'));
    }

    public function test_search_treats_sql_like_payload_as_bound_text(): void
    {
        Product::factory()->create(['name' => 'Produit existant']);

        $this->get('/shop?q=%27%20OR%201%3D1%20--')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Index')
                ->where('products.total', 0));
    }

    public function test_draft_product_is_not_visible_on_its_public_url(): void
    {
        $product = Product::factory()->create([
            'is_published' => false,
            'published_at' => null,
        ]);

        $this->get("/products/{$product->slug}")->assertNotFound();
    }
}
