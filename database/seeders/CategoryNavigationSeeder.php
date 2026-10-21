<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoryNavigationSeeder extends Seeder
{
    public function run(): void
    {
        $makeup = Category::query()->firstOrCreate(
            ['slug' => 'makeup'],
            ['name' => 'Makeup', 'is_published' => true, 'sort_order' => 10],
        );
        $skincare = Category::query()->firstOrCreate(
            ['slug' => 'skincare'],
            ['name' => 'Skincare', 'is_published' => true, 'sort_order' => 20],
        );

        foreach ([
            'eyes' => ['Eyes', $makeup->id, 10],
            'lips' => ['Lips', $makeup->id, 20],
            'face' => ['Face', $makeup->id, 30],
            'bodycare' => ['Bodycare', $skincare->id, 10],
            'cleansers' => ['Cleansers', $skincare->id, 20],
            'skincare-regime' => ['Skincare Regime', $skincare->id, 30],
            'toners' => ['Toners', $skincare->id, 40],
        ] as $slug => [$name, $parentId, $sortOrder]) {
            Category::query()->firstOrCreate(
                ['slug' => $slug],
                [
                    'parent_id' => $parentId,
                    'name' => $name,
                    'is_published' => true,
                    'sort_order' => $sortOrder,
                ],
            );
        }

        foreach ([
            'haircare' => ['Haircare', 30],
            'fragrance' => ['Fragrance', 40],
        ] as $slug => [$name, $sortOrder]) {
            Category::query()->firstOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'is_published' => true, 'sort_order' => $sortOrder],
            );
        }
    }
}
