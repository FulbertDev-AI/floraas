<?php

namespace Tests\Feature;

use App\Models\Category;
use Database\Seeders\CategoryNavigationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryNavigationSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_navigation_seed_is_idempotent_and_preserves_existing_categories(): void
    {
        $makeup = Category::factory()->create([
            'name' => 'Maquillage choisi par la boutique',
            'slug' => 'makeup',
        ]);
        $seeder = app(CategoryNavigationSeeder::class);

        $seeder->run();
        $seeder->run();

        $this->assertDatabaseCount('categories', 11);
        $this->assertDatabaseHas('categories', [
            'id' => $makeup->id,
            'name' => 'Maquillage choisi par la boutique',
            'slug' => 'makeup',
        ]);
        $this->assertDatabaseHas('categories', [
            'name' => 'Eyes',
            'slug' => 'eyes',
            'parent_id' => $makeup->id,
        ]);
    }
}
