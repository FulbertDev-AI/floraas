<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ProductImage;
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
            'contact' => $this->contactSettings(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'announcement.enabled' => ['required', 'boolean'],
            'announcement.text' => ['nullable', 'string', 'max:255', 'required_if:announcement.enabled,1'],
            'contact.location' => ['nullable', 'string', 'max:191'],
            'contact.phone' => ['nullable', 'string', 'max:40'],
            'contact.email' => ['nullable', 'email', 'max:254'],
            'contact.hours' => ['nullable', 'string', 'max:1000'],
            'homepage.hero_eyebrow' => ['nullable', 'string', 'max:100'],
            'homepage.hero_title' => ['required', 'string', 'max:150'],
            'homepage.hero_description' => ['nullable', 'string', 'max:1000'],
            'homepage.hero_button_text' => ['required', 'string', 'max:60'],
            'homepage.hero_button_url' => ['required', 'string', 'regex:~^/(?!/)[A-Za-z0-9_/-]*$~', 'max:191'],
            'homepage.hero_image_alt' => ['nullable', 'string', 'max:191'],
            'homepage.hero_image_position' => ['nullable', 'string', 'in:center,center right,center left,top,bottom'],
            'homepage.hero_visible' => ['sometimes', 'boolean'],
            'homepage.brand_story' => ['nullable', 'string', 'max:3000'],
            'homepage.show_categories' => ['required', 'boolean'],
            'homepage.show_featured_products' => ['required', 'boolean'],
            'homepage.show_new_products' => ['required', 'boolean'],
            'homepage.show_brand_story' => ['required', 'boolean'],
            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $previousHomepage = $this->homepageSettings();
        $homepage = array_merge($previousHomepage, $data['homepage']);
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
            $oldImagePath = $previousHomepage['hero_image_path'];
            $isUsedByAnotherSetting = StoreSetting::query()
                ->where('key', '<>', 'homepage')
                ->get(['value'])
                ->contains(fn (StoreSetting $setting): bool => str_contains(
                    json_encode($setting->value, JSON_THROW_ON_ERROR),
                    $oldImagePath,
                ));
            $isUsedByCategory = Category::query()->where('image_path', $oldImagePath)->exists();
            $isUsedByProduct = ProductImage::query()->where('path', $oldImagePath)->exists();

            if (! $isUsedByAnotherSetting && ! $isUsedByCategory && ! $isUsedByProduct) {
                Storage::disk('public')->delete($oldImagePath);
            }
        }

        if (isset($data['contact'])) {
            StoreSetting::query()->updateOrCreate(
                ['key' => 'contact'],
                ['value' => array_merge($this->contactSettings(), $data['contact'])],
            );
        }

        return redirect()->route('admin.settings.edit')->with('success', 'Les paramètres de la boutique ont été enregistrés.');
    }

    /**
     * @return array<string, mixed>
     */
    private function homepageSettings(): array
    {
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

        $homepage['hero_eyebrow'] = (string) ($homepage['hero_eyebrow'] ?? '');
        $homepage['hero_title'] = (string) ($homepage['hero_title'] ?? '');
        $homepage['hero_description'] = (string) ($homepage['hero_description'] ?? '');
        $homepage['hero_button_text'] = (string) ($homepage['hero_button_text'] ?? '');
        $homepage['hero_button_url'] = (string) ($homepage['hero_button_url'] ?? '/shop');
        $homepage['hero_image_alt'] = (string) ($homepage['hero_image_alt'] ?? '');
        $homepage['hero_image_position'] = (string) ($homepage['hero_image_position'] ?? 'center');
        $homepage['brand_story'] = (string) ($homepage['brand_story'] ?? '');

        return $homepage;
    }

    /**
     * @return array{location: string, phone: string, email: string, hours: string}
     */
    private function contactSettings(): array
    {
        $contact = StoreSetting::query()->where('key', 'contact')->first()?->value ?? [];

        return [
            'location' => $contact['location'] ?? 'Lomé, Togo',
            'phone' => $contact['phone'] ?? '',
            'email' => $contact['email'] ?? '',
            'hours' => $contact['hours'] ?? '',
        ];
    }
}
