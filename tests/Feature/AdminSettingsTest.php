<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
        ]))->assertRedirect('/admin/settings');

        $this->assertSame(
            'Un titre fourni par la marque',
            StoreSetting::query()->where('key', 'homepage')->firstOrFail()->value['hero_title'],
        );
        $this->assertSame(
            'Annonce de test',
            StoreSetting::query()->where('key', 'announcement')->firstOrFail()->value['text'],
        );

        $this->get('/')->assertInertia(fn ($page) => $page
            ->component('Home')
            ->where('homepage.hero_title', 'Un titre fourni par la marque')
            ->where('announcement.enabled', true)
            ->where('announcement.text', 'Annonce de test'));
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

    /**
     * @param  array<string, mixed>  $homepageOverrides
     * @return array<string, mixed>
     */
    private function settingsPayload(array $homepageOverrides = []): array
    {
        return [
            'announcement' => [
                'enabled' => true,
                'text' => 'Annonce de test',
            ],
            'homepage' => array_merge([
                'hero_title' => 'Titre provisoire',
                'hero_description' => 'Description provisoire',
                'hero_button_text' => 'Découvrir',
                'hero_button_url' => '/shop',
                'brand_story' => '',
                'show_categories' => true,
                'show_featured_products' => true,
                'show_new_products' => true,
                'show_brand_story' => false,
            ], $homepageOverrides),
        ];
    }
}
