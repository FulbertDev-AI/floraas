<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->withCount('products')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->through(fn (Category $category): array => [
                ...$category->attributesToArray(),
                'image_url' => $category->image_path ? Storage::disk('public')->url($category->image_path) : null,
            ]);

        return Inertia::render('Admin/Taxonomies/Index', [
            'kind' => 'categories',
            'title' => 'Catégories',
            'items' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Taxonomies/Form', [
            'kind' => 'categories',
            'title' => 'Nouvelle catégorie',
            'item' => null,
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $category = new Category;
        $category->fill([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['slug'] ?? '', $data['name']),
            'description' => $data['description'] ?? null,
            'is_published' => $data['is_published'],
            'sort_order' => $data['sort_order'],
            'image_path' => $request->file('image')?->store('categories', 'public'),
        ]);
        $category->save();

        return redirect()->route('admin.categories.index')->with('success', 'Catégorie enregistrée.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Taxonomies/Form', [
            'kind' => 'categories',
            'title' => 'Modifier la catégorie',
            'item' => [
                ...$category->attributesToArray(),
                'image_url' => $category->image_path ? Storage::disk('public')->url($category->image_path) : null,
            ],
        ]);
    }

    public function update(StoreCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $oldImagePath = $category->image_path;
        $imagePath = $request->file('image')?->store('categories', 'public') ?? $oldImagePath;
        $category->fill([
            'name' => $data['name'],
            'slug' => $this->uniqueSlug($data['slug'] ?? '', $data['name'], $category),
            'description' => $data['description'] ?? null,
            'image_path' => $imagePath,
            'is_published' => $data['is_published'],
            'sort_order' => $data['sort_order'],
        ]);
        $category->save();

        if ($imagePath !== $oldImagePath && $oldImagePath !== null) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return redirect()->route('admin.categories.index')->with('success', 'Catégorie mise à jour.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return back()->withErrors([
                'category' => 'Cette catégorie contient des produits. Réaffectez-les avant de la supprimer.',
            ]);
        }

        $category->delete();

        if ($category->image_path !== null) {
            Storage::disk('public')->delete($category->image_path);
        }

        return redirect()->route('admin.categories.index')->with('success', 'Catégorie supprimée.');
    }

    private function uniqueSlug(string $slug, string $name, ?Category $category = null): string
    {
        $slug = Str::slug($slug !== '' ? $slug : $name);
        $query = Category::query()->where('slug', $slug);

        if ($category !== null) {
            $query->where('id', '<>', $category->getKey());
        }

        return $query->exists() ? $slug.'-'.Str::lower(Str::random(6)) : $slug;
    }
}
