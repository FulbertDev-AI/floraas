<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\Storefront\ProductCardResource;
use App\Models\Category;
use App\Models\Collection;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::query()
            ->with(['primaryImage', 'categories'])
            ->orderByDesc('updated_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Product $product): array => [
                ...ProductCardResource::make($product)->resolve(request()),
                'is_published' => $product->is_published,
                'sku' => $product->sku,
                'categories' => $product->categories->pluck('name')->all(),
            ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            ...$this->formOptions(),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = $this->persistProduct($request, new Product);

        return redirect()->route('admin.products.edit', $product)
            ->with('success', 'Produit enregistré.');
    }

    public function edit(Product $product): Response
    {
        $product->load(['images', 'categories', 'collections']);
        $product->load('variants');

        return Inertia::render('Admin/Products/Form', [
            'product' => [
                ...$product->attributesToArray(),
                'price' => $product->price_minor === null ? '' : number_format($product->price_minor / 100, 2, '.', ''),
                'compare_at_price' => $product->compare_at_minor === null
                    ? ''
                    : number_format($product->compare_at_minor / 100, 2, '.', ''),
                'image_urls' => $product->images->map(fn ($image): array => [
                    'id' => $image->id,
                    'url' => Storage::disk('public')->url($image->path),
                    'alt_text' => $image->alt_text,
                    'is_primary' => $image->is_primary,
                ])->all(),
                'category_ids' => $product->categories->modelKeys(),
                'collection_ids' => $product->collections->modelKeys(),
                'variants' => $product->variants->map(fn ($variant): array => [
                    'id' => $variant->id,
                    'option_name' => $variant->option_name,
                    'option_value' => $variant->option_value,
                    'sku' => $variant->sku,
                    'price' => $variant->price_minor === null
                        ? ''
                        : number_format($variant->price_minor / 100, 2, '.', ''),
                    'stock_quantity' => $variant->stock_quantity,
                    'is_available' => $variant->is_available,
                ])->all(),
            ],
            ...$this->formOptions(),
        ]);
    }

    public function update(StoreProductRequest $request, Product $product): RedirectResponse
    {
        $this->persistProduct($request, $product);

        return redirect()->route('admin.products.edit', $product)
            ->with('success', 'Produit mis à jour.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('success', 'Produit archivé.');
    }

    /**
     * @return array{categories: array<int, array{id: int, name: string}>, collections: array<int, array{id: int, name: string}>}
     */
    private function formOptions(): array
    {
        return [
            'categories' => Category::query()->orderBy('name')->get(['id', 'name'])->toArray(),
            'collections' => Collection::query()->orderBy('name')->get(['id', 'name'])->toArray(),
        ];
    }

    private function persistProduct(StoreProductRequest $request, Product $product): Product
    {
        $data = $request->validated();
        $images = $request->file('images', []);
        $oldImageCount = $product->images()->count();
        $slug = $data['slug'] ?: Str::slug($data['name']);
        $slugQuery = Product::query()->where('slug', $slug);

        if ($product->exists) {
            $slugQuery->where('id', '<>', $product->getKey());
        }

        if ($slugQuery->exists()) {
            $slug .= '-'.Str::lower(Str::random(6));
        }

        return DB::transaction(function () use ($data, $images, $oldImageCount, $product, $slug): Product {
            $isPublished = (bool) $data['is_published'];
            $product->fill([
                'name' => $data['name'],
                'slug' => $slug,
                'sku' => $data['sku'] ?? null,
                'short_description' => $data['short_description'] ?? null,
                'description' => $data['description'] ?? null,
                'price_minor' => isset($data['price']) ? (int) round((float) $data['price'] * 100) : null,
                'compare_at_minor' => isset($data['compare_at_price'])
                    ? (int) round((float) $data['compare_at_price'] * 100)
                    : null,
                'currency' => $data['currency'] ?? null,
                'stock_quantity' => $data['stock_quantity'],
                'is_featured' => (bool) $data['is_featured'],
                'is_new' => (bool) $data['is_new'],
                'is_published' => $isPublished,
                'published_at' => $isPublished ? ($product->published_at ?? now()) : null,
            ]);
            $product->save();

            $product->categories()->sync($data['category_ids'] ?? []);
            $product->collections()->sync($data['collection_ids'] ?? []);
            $variantIds = [];

            foreach ($data['variants'] ?? [] as $variantData) {
                $variant = isset($variantData['id'])
                    ? $product->variants()->findOrFail($variantData['id'])
                    : $product->variants()->make();
                $variant->fill([
                    'option_name' => $variantData['option_name'],
                    'option_value' => $variantData['option_value'],
                    'sku' => $variantData['sku'] ?: null,
                    'price_minor' => isset($variantData['price'])
                        ? (int) round((float) $variantData['price'] * 100)
                        : null,
                    'stock_quantity' => $variantData['stock_quantity'],
                    'is_available' => (bool) $variantData['is_available'],
                    'sort_order' => count($variantIds),
                ]);
                $variant->save();
                $variantIds[] = $variant->getKey();
            }

            $product->variants()->whereNotIn('id', $variantIds)->delete();

            $primaryImageIndex = isset($data['primary_image_index'])
                ? (int) $data['primary_image_index']
                : ($oldImageCount === 0 && $images !== [] ? 0 : null);
            $primaryImageId = $data['primary_image_id'] ?? null;

            if ($primaryImageIndex !== null || $primaryImageId !== null) {
                $product->images()->update(['is_primary' => false]);

                if ($primaryImageId !== null) {
                    $product->images()->whereKey($primaryImageId)->update(['is_primary' => true]);
                }
            }

            if ($images !== []) {
                foreach ($images as $index => $image) {
                    if (! $image instanceof UploadedFile) {
                        continue;
                    }

                    $path = $image->store('products/'.$product->getKey(), 'public');

                    if ($path === false) {
                        throw new \RuntimeException('Impossible de stocker l’image du produit.');
                    }

                    $product->images()->create([
                        'path' => $path,
                        'alt_text' => $data['name'],
                        'is_primary' => $primaryImageIndex === $index,
                        'sort_order' => $oldImageCount + $index,
                    ]);
                }
            }

            return $product;
        });
    }
}
