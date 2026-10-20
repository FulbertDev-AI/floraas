<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DemoCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'demonstration-maquillage' => 'DÉMO — Maquillage',
            'demonstration-soins' => 'DÉMO — Soins',
        ];

        foreach ($categories as $slug => $name) {
            Category::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => 'Contenu de démonstration à remplacer par les informations de FLORAA’S.',
                    'is_published' => true,
                    'sort_order' => 0,
                ],
            );
        }

        foreach ([
            ['slug' => 'demo-baume', 'name' => 'DÉMO — Baume de soin', 'category' => 'demonstration-soins'],
            ['slug' => 'demo-rouge-a-levres', 'name' => 'DÉMO — Rouge à lèvres', 'category' => 'demonstration-maquillage'],
            ['slug' => 'demo-serum', 'name' => 'DÉMO — Sérum visage', 'category' => 'demonstration-soins'],
            ['slug' => 'demo-palette', 'name' => 'DÉMO — Palette', 'category' => 'demonstration-maquillage'],
        ] as $index => $data) {
            $product = Product::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'sku' => 'DEMO-'.str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT),
                    'short_description' => 'Produit fictif fourni uniquement pour la démonstration de l’interface.',
                    'description' => 'Ne pas vendre. Remplacer les informations, le prix, la devise et les images par les données validées de la marque.',
                    'price_minor' => 1000,
                    'currency' => 'XXX',
                    'stock_quantity' => 0,
                    'is_featured' => $index < 2,
                    'is_new' => $index >= 2,
                    'is_published' => true,
                    'published_at' => now(),
                ],
            );

            $product->categories()->sync([
                Category::query()->where('slug', $data['category'])->value('id'),
            ]);
        }
    }
}
