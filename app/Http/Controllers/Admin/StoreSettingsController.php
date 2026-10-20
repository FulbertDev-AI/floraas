<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingsController extends Controller
{
    public function edit(): Response
    {
        $homepage = $this->homepageSettings();
        $announcement = StoreSetting::query()->where('key', 'announcement')->first()?->value ?? [];

        return Inertia::render('Admin/Settings/Index', [
            'homepage' => [
                ...$homepage,
                'hero_image_url' => $homepage['hero_image_path']
                    ? Storage::disk('public')->url($homepage['hero_image_path'])
                    : null,
            ],
            'announcement' => [
                'enabled' => $announcement['enabled'] ?? false,
                'text' => $announcement['text'] ?? '',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'announcement.enabled' => ['required', 'boolean'],
            'announcement.text' => ['nullable', 'string', 'max:255', 'required_if:announcement.enabled,1'],
            'homepage.hero_title' => ['required', 'string', 'max:150'],
            'homepage.hero_description' => ['nullable', 'string', 'max:1000'],
            'homepage.hero_button_text' => ['required', 'string', 'max:60'],
            'homepage.hero_button_url' => ['required', 'string', 'regex:~^/(?!/)[A-Za-z0-9_/-]*$~', 'max:191'],
            'homepage.brand_story' => ['nullable', 'string', 'max:3000'],
            'homepage.show_categories' => ['required', 'boolean'],
            'homepage.show_featured_products' => ['required', 'boolean'],
            'homepage.show_new_products' => ['required', 'boolean'],
            'homepage.show_brand_story' => ['required', 'boolean'],
            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $homepage = $data['homepage'];
        $previousHomepage = $this->homepageSettings();
        $heroImagePath = $previousHomepage['hero_image_path'];

        if ($request->hasFile('hero_image')) {
            $heroImagePath = $request->file('hero_image')->store('storefront', 'public');

            if ($heroImagePath === false) {
                throw new \RuntimeException('Impossible de stocker l’image principale de la boutique.');
            }
        }

        $homepage['hero_image_path'] = $heroImagePath;

        StoreSetting::query()->updateOrCreate(
            ['key' => 'announcement'],
            ['value' => [
                'enabled' => (bool) $data['announcement']['enabled'],
                'text' => $data['announcement']['text'] ?? '',
            ]],
        );
        StoreSetting::query()->updateOrCreate(
            ['key' => 'homepage'],
            ['value' => $homepage],
        );

        if ($heroImagePath !== $previousHomepage['hero_image_path'] && $previousHomepage['hero_image_path'] !== null) {
            Storage::disk('public')->delete($previousHomepage['hero_image_path']);
        }

        return redirect()->route('admin.settings.edit')->with('success', 'Les paramètres de la boutique ont été enregistrés.');
    }

    /**
     * @return array<string, mixed>
     */
    private function homepageSettings(): array
    {
        $homepage = StoreSetting::query()->where('key', 'homepage')->first()?->value ?? [];

        return array_merge([
            'hero_title' => 'La beauté, à votre image.',
            'hero_description' => 'Explorez la sélection FLORAA’S.',
            'hero_button_text' => 'Explorer la boutique',
            'hero_button_url' => '/shop',
            'hero_image_path' => null,
            'brand_story' => '',
            'show_categories' => true,
            'show_featured_products' => true,
            'show_new_products' => true,
            'show_brand_story' => false,
        ], $homepage);
    }
}
