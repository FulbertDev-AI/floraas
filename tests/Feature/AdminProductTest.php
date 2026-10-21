<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_admin(): void
    {
        $this->get('/admin/products')->assertRedirect('/login');
    }

    public function test_customer_cannot_open_admin_pages(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)
            ->get('/admin/products')
            ->assertForbidden();
    }

    public function test_admin_can_create_a_published_product_with_server_saved_money(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Crème de jour',
            'slug' => 'creme-de-jour',
            'sku' => 'FL-CR-001',
            'short_description' => 'Une description fournie par le marchand.',
            'description' => 'Description détaillée.',
            'price' => '24.90',
            'compare_at_price' => '',
            'currency' => 'EUR',
            'stock_quantity' => 12,
            'is_featured' => true,
            'is_new' => true,
            'is_published' => true,
            'category_ids' => [],
            'collection_ids' => [],
            'variants' => [],
        ]);

        $product = Product::query()->where('slug', 'creme-de-jour')->firstOrFail();

        $response->assertRedirect(route('admin.products.edit', $product));
        $this->assertSame(2490, $product->price_minor);
        $this->assertNotNull($product->published_at);
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_published' => true,
            'stock_quantity' => 12,
        ]);
    }

    public function test_admin_can_create_a_draft_then_publish_it_to_the_public_catalog(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $productData = [
            'name' => 'Sérum lumière',
            'slug' => 'serum-lumiere',
            'sku' => 'FL-SER-001',
            'short_description' => 'Description de démonstration.',
            'description' => 'Contenu produit communiqué par la marque.',
            'price' => '19.90',
            'compare_at_price' => '',
            'currency' => 'EUR',
            'stock_quantity' => 5,
            'is_featured' => false,
            'is_new' => false,
            'category_ids' => [],
            'collection_ids' => [],
            'variants' => [],
        ];

        $this->actingAs($admin)->post('/admin/products', [
            ...$productData,
            'is_published' => false,
        ])->assertRedirect();

        $product = Product::query()->where('slug', 'serum-lumiere')->firstOrFail();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_published' => false,
            'published_at' => null,
        ]);
        $this->get('/products/serum-lumiere')->assertNotFound();

        $this->put('/admin/products/'.$product->id, [
            ...$productData,
            'is_published' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'is_published' => true,
        ]);
        $this->assertNotNull($product->fresh()->published_at);
        $this->get('/products/serum-lumiere')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Shop/Show')
                ->where('product.slug', 'serum-lumiere'));
    }

    public function test_admin_upload_rejects_a_non_image_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $this->actingAs($admin)->from('/admin/products/create')->post('/admin/products', [
            'name' => 'Image incorrecte',
            'slug' => 'image-incorrecte',
            'price' => '10.00',
            'currency' => 'EUR',
            'stock_quantity' => 1,
            'is_featured' => false,
            'is_new' => false,
            'is_published' => true,
            'category_ids' => [],
            'collection_ids' => [],
            'variants' => [],
            'images' => [UploadedFile::fake()->create('not-an-image.jpg', 20, 'text/plain')],
            'primary_image_index' => 0,
        ])->assertSessionHasErrors('images.0');

        $this->assertDatabaseMissing('products', ['slug' => 'image-incorrecte']);
    }

    public function test_customer_registration_cannot_assign_admin_role(): void
    {
        $this->post('/register', [
            'name' => 'Compte Client',
            'email' => 'client@example.test',
            'password' => 'SecurePass!123',
            'password_confirmation' => 'SecurePass!123',
            'role' => 'admin',
        ])->assertRedirect('/');

        $this->assertDatabaseHas('users', [
            'email' => 'client@example.test',
            'role' => 'customer',
        ]);
    }

    public function test_admin_can_upload_product_images_and_assign_categories(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $category = Category::factory()->create(['is_published' => true]);

        $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Baume de soin',
            'slug' => 'baume-de-soin',
            'price' => '12.50',
            'currency' => 'EUR',
            'stock_quantity' => 3,
            'is_featured' => true,
            'is_new' => false,
            'is_published' => true,
            'category_ids' => [$category->id],
            'collection_ids' => [],
            'variants' => [],
            'images' => [UploadedFile::fake()->image('baume.jpg', 600, 600)],
            'primary_image_index' => 0,
        ])->assertRedirect();

        $product = Product::query()->where('slug', 'baume-de-soin')->firstOrFail();
        $image = $product->images()->firstOrFail();

        $this->assertTrue($image->is_primary);
        $this->assertTrue($product->categories->contains($category));
        Storage::disk('public')->assertExists($image->path);

        $imageUrl = '/storage/'.$image->path;

        $this->get('/shop')
            ->assertInertia(fn (Assert $page) => $page
                ->where('products.data.0.primary_image.url', $imageUrl));
        $this->get('/')
            ->assertInertia(fn (Assert $page) => $page
                ->where('featuredProducts.0.primary_image.url', $imageUrl));
        $this->get('/products/baume-de-soin')
            ->assertInertia(fn (Assert $page) => $page
                ->where('product.primary_image.url', $imageUrl)
                ->where('product.images.0.url', $imageUrl));
    }

    public function test_admin_can_select_an_existing_product_image_as_primary(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $product = Product::factory()->create();
        $currentPrimary = $product->images()->create([
            'path' => 'products/'.$product->id.'/front.jpg',
            'alt_text' => 'Face avant',
            'is_primary' => true,
            'sort_order' => 0,
        ]);
        $newPrimary = $product->images()->create([
            'path' => 'products/'.$product->id.'/side.jpg',
            'alt_text' => 'Vue de côté',
            'is_primary' => false,
            'sort_order' => 1,
        ]);

        $this->actingAs($admin)->put('/admin/products/'.$product->id, [
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'short_description' => $product->short_description,
            'description' => $product->description,
            'price' => '25.00',
            'compare_at_price' => '',
            'currency' => 'EUR',
            'stock_quantity' => 10,
            'is_featured' => false,
            'is_new' => false,
            'is_published' => true,
            'category_ids' => [],
            'collection_ids' => [],
            'variants' => [],
            'primary_image_id' => $newPrimary->id,
        ])->assertRedirect();

        $this->assertDatabaseHas('product_images', [
            'id' => $currentPrimary->id,
            'is_primary' => false,
        ]);
        $this->assertDatabaseHas('product_images', [
            'id' => $newPrimary->id,
            'is_primary' => true,
        ]);
    }

    public function test_admin_cannot_select_an_image_owned_by_another_product(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $product = Product::factory()->create();
        $otherProduct = Product::factory()->create();
        $foreignImage = $otherProduct->images()->create([
            'path' => 'products/'.$otherProduct->id.'/foreign.jpg',
            'alt_text' => 'Image étrangère',
            'is_primary' => true,
            'sort_order' => 0,
        ]);

        $this->actingAs($admin)->put('/admin/products/'.$product->id, [
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'price' => '25.00',
            'currency' => 'EUR',
            'stock_quantity' => 10,
            'is_featured' => false,
            'is_new' => false,
            'is_published' => true,
            'category_ids' => [],
            'collection_ids' => [],
            'variants' => [],
            'primary_image_id' => $foreignImage->id,
        ])->assertSessionHasErrors('primary_image_id');

        $this->assertDatabaseHas('product_images', [
            'id' => $foreignImage->id,
            'is_primary' => true,
        ]);
    }

    public function test_customer_cannot_publish_products_even_with_valid_payload(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer)->post('/admin/products', [
            'name' => 'Produit interdit',
            'slug' => 'produit-interdit',
            'price' => '10.00',
            'currency' => 'EUR',
            'stock_quantity' => 3,
            'is_featured' => false,
            'is_new' => false,
            'is_published' => true,
            'category_ids' => [],
            'collection_ids' => [],
            'variants' => [],
        ])->assertForbidden();

        $this->assertDatabaseMissing('products', ['slug' => 'produit-interdit']);
    }
}
