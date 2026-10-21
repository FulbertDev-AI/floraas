<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
        ]);
        $search = trim($filters['q'] ?? '');
        $query = Category::query()
            ->with('parentCategory:id,name')
            ->withCount('products');

        if ($search !== '') {
            $query->where(function (Builder $categories) use ($search): void {
                $categories->where('name', 'like', '%'.$search.'%')
                    ->orWhere('slug', 'like', '%'.$search.'%');
            });
        }

        $categories = $query
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Category $category): array => [
                ...$category->attributesToArray(),
                'parent_name' => $category->parentCategory?->name,
                'image_url' => $category->image_path ? Storage::disk('public')->url($category->image_path) : null,
            ]);

        return Inertia::render('Admin/Taxonomies/Index', [
            'kind' => 'categories',
            'title' => 'Catégories',
            'items' => $categories,
            'query' => $search,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Taxonomies/Form', [
            'kind' => 'categories',
            'title' => 'Nouvelle catégorie',
            'item' => null,
            'parents' => $this->parentCategories(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $category = new Category;
        $category->fill([
            'name' => $data['name'],
            'parent_id' => $data['parent_id'] ?? null,
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
                'parent_name' => $category->parentCategory?->name,
                'image_url' => $category->image_path ? Storage::disk('public')->url($category->image_path) : null,
            ],
            'parents' => $this->parentCategories($category),
        ]);
    }

    public function update(StoreCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $oldImagePath = $category->image_path;
        $imagePath = $request->file('image')?->store('categories', 'public') ?? $oldImagePath;
        $category->fill([
            'name' => $data['name'],
            'parent_id' => $data['parent_id'] ?? null,
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
        if ($category->products()->exists() || $category->childCategories()->exists()) {
            return back()->withErrors([
                'category' => 'Cette catégorie contient des produits ou des sous-catégories. Réaffectez-les avant de la supprimer.',
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

    /**
     * @return Collection<int, Category>
     */
    private function parentCategories(?Category $category = null): Collection
    {
        return Category::query()
            ->whereNull('parent_id')
            ->when($category, fn (Builder $query): Builder => $query->where('id', '<>', $category->getKey()))
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
