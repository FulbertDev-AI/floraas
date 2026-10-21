<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\Storefront\CategoryResource;
use App\Http\Resources\Storefront\ProductCardResource;
use App\Models\Category;
use App\Models\Collection as ProductCollection;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->listing($request, Product::query()->published(), 'La boutique');
    }

    public function category(Request $request, Category $category): Response
    {
        abort_unless($category->is_published, 404);
        $categoryIds = Category::query()
            ->where('is_published', true)
            ->where(function (Builder $categories) use ($category): void {
                $categories->whereKey($category->getKey())
                    ->orWhere('parent_id', $category->getKey());
            })
            ->pluck('id');

        return $this->listing(
            $request,
            Product::query()->published()->whereHas(
                'categories',
                fn (Builder $query): Builder => $query->whereIn('categories.id', $categoryIds),
            ),
            $category->name,
            CategoryResource::make($category)->resolve($request),
        );
    }

    public function collection(Request $request, ProductCollection $collection): Response
    {
        abort_unless($collection->is_published, 404);

        return $this->listing(
            $request,
            Product::query()->published()->whereHas(
                'collections',
                fn (Builder $query): Builder => $query->whereKey($collection->getKey()),
            ),
            $collection->name,
            ['name' => $collection->name, 'description' => $collection->description],
        );
    }

    public function show(Request $request, Product $product): Response
    {
        $product = Product::query()
            ->published()
            ->with(['images', 'variants', 'categories'])
            ->whereKey($product->getKey())
            ->firstOrFail();

        $productData = ProductCardResource::make($product->load('primaryImage'))->resolve($request);
        $productData['description'] = $product->description;
        $productData['images'] = $product->images->map(fn ($image): array => [
            'id' => $image->id,
            'url' => Storage::disk('public')->url($image->path),
            'alt_text' => $image->alt_text,
            'is_primary' => $image->is_primary,
        ])->all();
        $productData['variants'] = $product->variants
            ->where('is_available', true)
            ->map(fn ($variant): array => [
                'id' => $variant->id,
                'option_name' => $variant->option_name,
                'option_value' => $variant->option_value,
                'price_minor' => $variant->price_minor,
                'stock_quantity' => $variant->stock_quantity,
            ])
            ->values()
            ->all();

        $canonicalUrl = rtrim((string) config('app.url'), '/')
            .route('products.show', ['product' => $product->slug], false);
        $primaryImageUrl = $productData['primary_image'] === null
            ? null
            : $this->canonicalAssetUrl($productData['primary_image']['url']);
        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'description' => strip_tags((string) ($product->short_description ?? $product->description ?? '')),
            'url' => $canonicalUrl,
        ];

        if ($product->sku !== null) {
            $structuredData['sku'] = $product->sku;
        }

        $productImages = collect($productData['images'])
            ->map(fn (array $image): string => $this->canonicalAssetUrl($image['url']))
            ->all();

        if ($productImages !== []) {
            $structuredData['image'] = $productImages;
        }

        if ($product->price_minor !== null && $product->currency !== null) {
            $hasAvailableStock = $product->stock_quantity > 0
                || $product->variants->contains(
                    fn ($variant): bool => $variant->is_available && $variant->stock_quantity > 0,
                );

            $structuredData['offers'] = [
                '@type' => 'Offer',
                'priceCurrency' => $product->currency,
                'price' => intdiv($product->price_minor, 100).'.'.str_pad(
                    (string) ($product->price_minor % 100),
                    2,
                    '0',
                    STR_PAD_LEFT,
                ),
                'availability' => $hasAvailableStock
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                'url' => $canonicalUrl,
            ];
        }

        return Inertia::render('Shop/Show', [
            'product' => [
                ...$productData,
                'canonical_url' => $canonicalUrl,
                'primary_image_url' => $primaryImageUrl,
                'structured_data' => json_encode(
                    $structuredData,
                    JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR,
                ),
            ],
        ]);
    }

    private function canonicalAssetUrl(string $assetUrl): string
    {
        if (str_starts_with($assetUrl, 'http://') || str_starts_with($assetUrl, 'https://')) {
            return $assetUrl;
        }

        return rtrim((string) config('app.url'), '/').'/'.ltrim($assetUrl, '/');
    }

    private function listing(
        Request $request,
        Builder $query,
        string $title,
        ?array $context = null,
    ): Response {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in(['relevance', 'newest', 'price_asc', 'price_desc'])],
            'in_stock' => ['nullable', 'boolean'],
            'category' => ['nullable', 'string', 'max:191'],
            'on_sale' => ['nullable', 'boolean'],
        ]);

        $search = trim($filters['q'] ?? '');

        if ($search !== '') {
            $query->where(function (Builder $products) use ($search): void {
                $products->where('name', 'like', '%'.$search.'%')
                    ->orWhere('short_description', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('sku', 'like', '%'.$search.'%');
            });
        }

        if (filter_var($filters['in_stock'] ?? false, FILTER_VALIDATE_BOOL)) {
            $query->where(function (Builder $stockQuery): void {
                $stockQuery->where('stock_quantity', '>', 0)
                    ->orWhereHas('variants', function (Builder $variants): void {
                        $variants->where('is_available', true)->where('stock_quantity', '>', 0);
                    });
            });
        }

        $categorySlug = trim($filters['category'] ?? '');

        if ($categorySlug !== '') {
            $categoryIds = Category::query()
                ->where('is_published', true)
                ->where(function (Builder $categories) use ($categorySlug): void {
                    $categories->where('slug', $categorySlug)
                        ->orWhereIn('parent_id', Category::query()
                            ->select('id')
                            ->where('slug', $categorySlug)
                            ->where('is_published', true));
                })
                ->pluck('id');

            $query->whereHas(
                'categories',
                fn (Builder $categories): Builder => $categories->whereIn('categories.id', $categoryIds),
            );
        }

        if (filter_var($filters['on_sale'] ?? false, FILTER_VALIDATE_BOOL)) {
            $query->whereNotNull('compare_at_minor')
                ->whereColumn('compare_at_minor', '>', 'price_minor');
        }

        match ($filters['sort'] ?? 'relevance') {
            'newest' => $query->orderByDesc('published_at')->orderByDesc('id'),
            'price_asc' => $query->orderBy('price_minor')->orderBy('id'),
            'price_desc' => $query->orderByDesc('price_minor')->orderByDesc('id'),
            default => $query->orderByDesc('is_featured')->orderByDesc('published_at')->orderByDesc('id'),
        };

        $products = $query
            ->with('primaryImage')
            ->paginate(16)
            ->withQueryString()
            ->through(fn (Product $product): array => ProductCardResource::make($product)->resolve($request));

        return Inertia::render('Shop/Index', [
            'title' => $title,
            'context' => $context,
            'products' => $products,
            'filters' => [
                'q' => $search,
                'sort' => $filters['sort'] ?? 'relevance',
                'in_stock' => filter_var($filters['in_stock'] ?? false, FILTER_VALIDATE_BOOL),
                'category' => $categorySlug,
                'on_sale' => filter_var($filters['on_sale'] ?? false, FILTER_VALIDATE_BOOL),
            ],
        ]);
    }
}
