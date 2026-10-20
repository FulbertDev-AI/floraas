<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(3, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 999999),
            'sku' => fake()->unique()->bothify('FL-####??'),
            'short_description' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'price_minor' => fake()->numberBetween(1000, 25000),
            'compare_at_minor' => null,
            'currency' => 'EUR',
            'stock_quantity' => fake()->numberBetween(0, 50),
            'is_featured' => false,
            'is_new' => false,
            'is_published' => true,
            'published_at' => now(),
        ];
    }
}
