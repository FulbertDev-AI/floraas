<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\Storefront\CategoryResource;
use App\Http\Resources\Storefront\ProductCardResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $categories = Category::query()
            ->where('is_published', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit(8)
            ->get();

        $featuredProducts = Product::query()
            ->published()
            ->where('is_featured', true)
            ->with('primaryImage')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit(4)
            ->get();

        $newProducts = Product::query()
            ->published()
            ->where('is_new', true)
            ->with('primaryImage')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit(4)
            ->get();
        $homepage = StoreSetting::query()->where('key', 'homepage')->first()?->value ?? [];
        $homepage = array_merge([
            'hero_eyebrow' => 'RÉVÉLEZ VOTRE ÉCLAT',
            'hero_title' => 'La beauté qui vous ressemble',
            'hero_description' => 'Découvrez notre sélection de soins, maquillage et essentiels beauté, pensés pour révéler votre éclat au quotidien.',
            'hero_button_text' => 'Découvrir la boutique',
            'hero_button_url' => '/shop',
            'hero_image_path' => null,
            'hero_image_alt' => '',
            'hero_image_position' => 'center',
            'hero_visible' => true,
            'brand_story' => '',
            'show_categories' => true,
            'show_featured_products' => true,
            'show_new_products' => true,
            'show_brand_story' => false,
        ], $homepage);
        foreach (['hero_visible', 'show_categories', 'show_featured_products', 'show_new_products', 'show_brand_story'] as $setting) {
            $homepage[$setting] = filter_var($homepage[$setting], FILTER_VALIDATE_BOOL);
        }
        $homepage['hero_image_url'] = $homepage['hero_image_path']
            ? Storage::disk('public')->url($homepage['hero_image_path'])
            : null;

        return Inertia::render('Home', [
            'categories' => CategoryResource::collection($categories)->resolve($request),
            'featuredProducts' => ProductCardResource::collection($featuredProducts)->resolve($request),
            'newProducts' => ProductCardResource::collection($newProducts)->resolve($request),
            'homepage' => $homepage,
        ]);
    }
}
