<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()?->only('id', 'name', 'email', 'role'),
            ],
            'flash' => [
                'success' => fn (): ?string => $request->session()->get('success'),
                'status' => fn (): ?string => $request->session()->get('status'),
            ],
            'cart_count' => fn (): int => collect($request->session()->get('storefront.cart', []))
                ->sum(fn (array $line): int => (int) ($line['quantity'] ?? 0)),
            'navigation_categories' => fn (): array => Category::query()
                ->where('is_published', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'image_path', 'parent_id'])
                ->map(fn (Category $category): array => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'parent_id' => $category->parent_id,
                    'image_url' => $category->image_path
                        ? Storage::disk('public')->url($category->image_path)
                        : null,
                ])
                ->all(),
            'store_contact' => fn (): array => array_merge([
                'location' => 'Lomé, Togo',
                'phone' => '',
                'email' => '',
                'hours' => '',
            ], StoreSetting::query()->where('key', 'contact')->value('value') ?? []),
            'announcement' => fn (): ?array => StoreSetting::query()
                ->where('key', 'announcement')
                ->value('value'),
        ];
    }
}
