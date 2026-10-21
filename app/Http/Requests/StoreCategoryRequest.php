<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->getKey() : null;

        return [
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->where(function (QueryBuilder $query) use ($categoryId): void {
                    $query->whereNull('parent_id');

                    if ($categoryId !== null) {
                        $query->where('id', '<>', $categoryId);
                    }
                }),
            ],
            'name' => ['required', 'string', 'max:191'],
            'slug' => ['nullable', 'string', 'max:191', Rule::unique('categories', 'slug')->ignore($categoryId)],
            'description' => ['nullable', 'string', 'max:5000'],
            'image' => ['sometimes', 'image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
            'is_published' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:65535'],
        ];
    }

    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $category = $this->route('category');

                if (
                    $category instanceof Category
                    && $category->childCategories()->exists()
                    && $this->filled('parent_id')
                ) {
                    $validator->errors()->add(
                        'parent_id',
                        'Une catégorie qui possède des sous-catégories doit rester une catégorie principale.',
                    );
                }
            },
        ];
    }
}
