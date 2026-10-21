<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_homepage_content_and_announcement(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $this->actingAs($admin)->put('/admin/settings', $this->settingsPayload([
            'hero_title' => 'Un titre fourni par la marque',
            'hero_description' => 'Description validée.',
            'hero_eyebrow' => 'RÉVÉLEZ VOTRE ÉCLAT',
            'hero_visible' => false,
            'hero_image_position' => 'center right',
        ], [
            'location' => 'Lomé, Togo',
            'email' => 'boutique@example.test',
        ]))->assertRedirect('/admin/settings');

        $this->assertSame(
            'Un titre fourni par la marque',
            StoreSetting::query()->where('key', 'homepage')->firstOrFail()->value['hero_title'],
        );
        $this->assertSame(
            'Annonce de test',
            StoreSetting::query()->where('key', 'announcement')->firstOrFail()->value['text'],
        );
        $this->assertSame(
            'boutique@example.test',
            StoreSetting::query()->where('key', 'contact')->firstOrFail()->value['email'],
        );

        $this->get('/')->assertInertia(fn ($page) => $page
            ->component('Home')
            ->where('homepage.hero_title', 'Un titre fourni par la marque')
            ->where('homepage.hero_visible', false)
            ->where('announcement.enabled', true)
            ->where('announcement.text', 'Annonce de test')
            ->where('store_contact.location', 'Lomé, Togo')
            ->where('store_contact.email', 'boutique@example.test'));
    }

    public function test_homepage_button_cannot_redirect_to_an_external_host(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();

        $this->actingAs($admin)
            ->from('/admin/settings')
            ->put('/admin/settings', $this->settingsPayload([
                'hero_button_url' => '//example.org',
            ]))
            ->assertSessionHasErrors('homepage.hero_button_url');
    }

    public function test_category_cannot_be_deleted_while_products_are_assigned(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $category = Category::factory()->create();
        $product = Product::factory()->create();
        $category->products()->attach($product);

        $this->actingAs($admin)
            ->delete("/admin/categories/{$category->id}")
            ->assertSessionHasErrors('category');

        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_admin_can_create_a_subcategory_and_search_categories(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $parent = Category::factory()->create(['name' => 'Makeup']);

        $this->actingAs($admin)
            ->post('/admin/categories', [
                'parent_id' => $parent->id,
                'name' => 'Eyes',
                'slug' => 'eyes',
                'description' => 'Maquillage des yeux.',
                'is_published' => true,
                'sort_order' => 10,
            ])
            ->assertRedirect('/admin/categories');

        $this->assertDatabaseHas('categories', [
            'name' => 'Eyes',
            'slug' => 'eyes',
            'parent_id' => $parent->id,
        ]);

        $this->actingAs($admin)
            ->get('/admin/categories?q=Eyes')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Taxonomies/Index')
                ->where('query', 'Eyes')
                ->where('items.total', 1)
                ->where('items.data.0.parent_name', 'Makeup'));
    }

    public function test_category_with_subcategories_cannot_be_deleted(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $parent = Category::factory()->create();
        Category::factory()->create(['parent_id' => $parent->id]);

        $this->actingAs($admin)
            ->delete("/admin/categories/{$parent->id}")
            ->assertSessionHasErrors('category');

        $this->assertDatabaseHas('categories', ['id' => $parent->id]);
    }

    public function test_replacing_homepage_image_keeps_files_referenced_by_categories(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        $admin->forceFill(['role' => 'admin'])->save();
        $oldImagePath = 'storefront/shared-image.jpg';
        Storage::disk('public')->put($oldImagePath, 'category image');
        Category::factory()->create(['image_path' => $oldImagePath]);
        StoreSetting::query()->create([
            'key' => 'homepage',
            'value' => array_merge($this->settingsPayload()['homepage'], [
                'hero_image_path' => $oldImagePath,
            ]),
        ]);

        $this->actingAs($admin)
            ->put('/admin/settings', array_merge(
                $this->settingsPayload(['hero_image_alt' => 'Portrait beauté']),
                ['hero_image' => UploadedFile::fake()->image('hero.jpg')],
            ))
            ->assertRedirect('/admin/settings');

        $newImagePath = StoreSetting::query()->where('key', 'homepage')->firstOrFail()->value['hero_image_path'];
        Storage::disk('public')->assertExists($newImagePath);
        Storage::disk('public')->assertExists($oldImagePath);
        $this->assertSame(
            'Portrait beauté',
            StoreSetting::query()->where('key', 'homepage')->firstOrFail()->value['hero_image_alt'],
        );
    }

    /**
     * @param  array<string, mixed>  $homepageOverrides
     * @return array<string, mixed>
     */
    private function settingsPayload(array $homepageOverrides = [], array $contactOverrides = []): array
    {
        return [
            'announcement' => [
                'enabled' => true,
                'text' => 'Annonce de test',
            ],
            'contact' => array_merge([
                'location' => 'Lomé, Togo',
                'phone' => '',
                'email' => '',
                'hours' => '',
            ], $contactOverrides),
            'homepage' => array_merge([
                'hero_eyebrow' => 'RÉVÉLEZ VOTRE ÉCLAT',
                'hero_title' => 'La beauté qui vous ressemble',
                'hero_description' => 'Découvrez la sélection.',
                'hero_button_text' => 'Découvrir la boutique',
                'hero_button_url' => '/shop',
                'hero_image_alt' => '',
                'hero_image_position' => 'center',
                'hero_visible' => true,
                'brand_story' => '',
                'show_categories' => true,
                'show_featured_products' => true,
                'show_new_products' => true,
                'show_brand_story' => false,
            ], $homepageOverrides),
        ];
    }
}
