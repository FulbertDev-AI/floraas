<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Collection as ProductCollection;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_lists_published_storefront_content_using_the_configured_host(): void
    {
        config(['app.url' => 'https://floraas.example']);

        $product = Product::factory()->create();
        $draftProduct = Product::factory()->create(['is_published' => false, 'published_at' => null]);
        $category = Category::factory()->create(['is_published' => true]);
        $draftCategory = Category::factory()->create(['is_published' => false]);
        $collection = ProductCollection::factory()->create(['is_published' => true]);
        $draftCollection = ProductCollection::factory()->create(['is_published' => false]);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('https://floraas.example/products/'.$product->slug, false)
            ->assertSee('https://floraas.example/categories/'.$category->slug, false)
            ->assertSee('https://floraas.example/collections/'.$collection->slug, false)
            ->assertDontSee('/products/'.$draftProduct->slug, false)
            ->assertDontSee('/categories/'.$draftCategory->slug, false)
            ->assertDontSee('/collections/'.$draftCollection->slug, false);
    }

    public function test_robots_file_disallows_private_store_routes_and_points_to_the_sitemap(): void
    {
        config(['app.url' => 'https://floraas.example']);

        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSee('Disallow: /admin')
            ->assertSee('Disallow: /cart')
            ->assertSee('Disallow: /checkout')
            ->assertSee('Sitemap: https://floraas.example/sitemap.xml');
    }

    public function test_product_structured_data_is_valid_and_safe_for_script_embedding(): void
    {
        $name = '</script><script>alert(1)</script>';
        $product = Product::factory()->create([
            'name' => $name,
            'slug' => 'seo-json-ld-product',
            'price_minor' => 2399,
            'currency' => 'USD',
            'stock_quantity' => 2,
        ]);
        $structuredData = null;

        $this->get("/products/{$product->slug}")
            ->assertOk()
            ->assertInertia(function (Assert $page) use (&$structuredData): void {
                $page->component('Shop/Show')->etc();
                $structuredData = $page->toArray()['props']['product']['structured_data'];
            });

        $decodedData = json_decode($structuredData, true, flags: JSON_THROW_ON_ERROR);

        $this->assertSame($name, $decodedData['name']);
        $this->assertSame('23.99', $decodedData['offers']['price']);
        $this->assertSame('https://schema.org/InStock', $decodedData['offers']['availability']);
        $this->assertSame(false, str_contains($structuredData, '</script>'));
    }
}
