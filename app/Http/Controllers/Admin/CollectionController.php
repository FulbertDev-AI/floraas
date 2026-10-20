<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCollectionRequest;
use App\Models\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    public function index(): Response
    {
        $collections = Collection::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn (Collection $collection): array => [
                ...$collection->attributesToArray(),
                'image_url' => $collection->image_path
                    ? Storage::disk('public')->url($collection->image_path)
                    : null,
            ]);

        return Inertia::render('Admin/Taxonomies/Index', [
            'kind' => 'collections',
            'title' => 'Collections',
            'items' => $collections,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Taxonomies/Form', [
            'kind' => 'collections',
            'title' => 'Nouvelle collection',
            'item' => null,
        ]);
    }

    public function store(StoreCollectionRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $collection = new Collection;
        $collection->fill([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['slug'] ?? '', $data['name']),
            'description' => $data['description'] ?? null,
            'is_published' => $data['is_published'],
            'sort_order' => $data['sort_order'],
            'image_path' => $request->file('image')?->store('collections', 'public'),
        ]);
        $collection->save();

        return redirect()->route('admin.collections.index')->with('success', 'Collection enregistrée.');
    }

    public function edit(Collection $collection): Response
    {
        return Inertia::render('Admin/Taxonomies/Form', [
            'kind' => 'collections',
            'title' => 'Modifier la collection',
            'item' => [
                ...$collection->attributesToArray(),
                'image_url' => $collection->image_path ? Storage::disk('public')->url($collection->image_path) : null,
            ],
        ]);
    }

    public function update(StoreCollectionRequest $request, Collection $collection): RedirectResponse
    {
        $data = $request->validated();
        $oldImagePath = $collection->image_path;
        $imagePath = $request->file('image')?->store('collections', 'public') ?? $oldImagePath;
        $collection->fill([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['slug'] ?? '', $data['name'], $collection),
            'description' => $data['description'] ?? null,
            'image_path' => $imagePath,
            'is_published' => $data['is_published'],
            'sort_order' => $data['sort_order'],
        ]);
        $collection->save();

        if ($imagePath !== $oldImagePath && $oldImagePath !== null) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return redirect()->route('admin.collections.index')->with('success', 'Collection mise à jour.');
    }

    public function destroy(Collection $collection): RedirectResponse
    {
        if ($collection->products()->exists()) {
            return back()->withErrors([
                'collection' => 'Cette collection contient des produits. Réaffectez-les avant de la supprimer.',
            ]);
        }

        $collection->delete();

        if ($collection->image_path !== null) {
            Storage::disk('public')->delete($collection->image_path);
        }

        return redirect()->route('admin.collections.index')->with('success', 'Collection supprimée.');
    }

    private function uniqueSlug(string $slug, string $name, ?Collection $collection = null): string
    {
        $slug = Str::slug($slug !== '' ? $slug : $name);
        $query = Collection::query()->where('slug', $slug);

        if ($collection !== null) {
            $query->where('id', '<>', $collection->getKey());
        }

        return $query->exists() ? $slug.'-'.Str::lower(Str::random(6)) : $slug;
    }
}
