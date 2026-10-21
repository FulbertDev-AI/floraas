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
        Category::factory()->create([
            'is_published' => true,
            'parent_id' => $category->id,
        ]);
        $featuredProduct = Product::factory()->create(['is_featured' => true]);
        $featuredProduct->categories()->attach($category);
        Product::factory()->create(['is_published' => false, 'is_featured' => true]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->has('categories', 1)
                ->where('categories.0.slug', $category->slug)
                ->has('navigation_categories', 2)
                ->where('navigation_categories.1.parent_id', $category->id)
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

    public function test_parent_category_includes_published_products_from_its_subcategories(): void
    {
        $category = Category::factory()->create(['slug' => 'makeup-parent']);
        $subcategory = Category::factory()->create([
            'parent_id' => $category->id,
            'slug' => 'eyes-subcategory',
        ]);
        $product = Product::factory()->create();
        $product->categories()->attach($subcategory);

        $this->get("/categories/{$category->slug}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Index')
                ->where('products.total', 1)
                ->where('products.data.0.slug', $product->slug));
    }

    public function test_navigation_filters_show_only_products_in_the_selected_category_or_on_sale(): void
    {
        $category = Category::factory()->create(['slug' => 'makeup']);
        $subcategory = Category::factory()->create([
            'parent_id' => $category->id,
            'slug' => 'lips',
        ]);
        $saleProduct = Product::factory()->create([
            'price_minor' => 800,
            'compare_at_minor' => 1000,
        ]);
        $saleProduct->categories()->attach($subcategory);
        Product::factory()->create([
            'price_minor' => 700,
            'compare_at_minor' => null,
        ]);

        $this->get('/shop?category=makeup&on_sale=1')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Index')
                ->where('products.total', 1)
                ->where('products.data.0.slug', $saleProduct->slug)
                ->where('filters.category', 'makeup')
                ->where('filters.on_sale', true));
    }
}
