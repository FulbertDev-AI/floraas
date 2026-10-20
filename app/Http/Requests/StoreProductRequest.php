<?php

namespace App\Http\Requests;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->getKey() : null;

        return [
            'name' => ['required', 'string', 'max:191'],
            'slug' => ['nullable', 'string', 'max:191', Rule::unique('products', 'slug')->ignore($productId)],
            'sku' => ['nullable', 'string', 'max:80', Rule::unique('products', 'sku')->ignore($productId)],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:20000'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'currency' => ['nullable', 'string', 'regex:/^[A-Z]{3}$/'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:2147483647'],
            'is_featured' => ['required', 'boolean'],
            'is_new' => ['required', 'boolean'],
            'is_published' => ['required', 'boolean'],
            'category_ids' => ['array'],
            'category_ids.*' => ['integer', 'distinct', 'exists:categories,id'],
            'collection_ids' => ['array'],
            'collection_ids.*' => ['integer', 'distinct', 'exists:collections,id'],
            'variants' => ['array', 'max:40'],
            'variants.*.id' => ['nullable', 'integer'],
            'variants.*.option_name' => ['required', 'string', 'max:80'],
            'variants.*.option_value' => ['required', 'string', 'max:120'],
            'variants.*.sku' => ['nullable', 'string', 'max:80'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'variants.*.stock_quantity' => ['required', 'integer', 'min:0', 'max:2147483647'],
            'variants.*.is_available' => ['required', 'boolean'],
            'images' => ['sometimes', 'array', 'max:8'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
            'primary_image_index' => ['nullable', 'integer', 'min:0', 'max:7'],
            'primary_image_id' => ['nullable', 'integer'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! $this->boolean('is_published')) {
                    $this->validateProductImageOwnership($validator);

                    return;
                }

                if (! is_numeric($this->input('price')) || ! is_string($this->input('currency'))) {
                    $validator->errors()->add('price', 'Un prix et une devise ISO 4217 sont requis pour publier ce produit.');
                }

                $price = $this->input('price');
                $compareAtPrice = $this->input('compare_at_price');

                if (is_numeric($price) && is_numeric($compareAtPrice) && (float) $compareAtPrice <= (float) $price) {
                    $validator->errors()->add('compare_at_price', 'Le prix initial doit être supérieur au prix de vente.');
                }

                $optionValues = [];

                foreach ($this->input('variants', []) as $index => $variant) {
                    if (! is_array($variant)) {
                        continue;
                    }

                    if (isset($variant['option_name'], $variant['option_value'])) {
                        $combination = mb_strtolower(trim($variant['option_name']).'|'.trim($variant['option_value']));

                        if (isset($optionValues[$combination])) {
                            $validator->errors()->add(
                                "variants.{$index}.option_value",
                                'Chaque combinaison d’option doit être unique pour ce produit.',
                            );
                        }

                        $optionValues[$combination] = true;
                    }

                    if (! empty($variant['sku'])) {
                        $skuQuery = ProductVariant::query()->where('sku', $variant['sku']);

                        if (! empty($variant['id'])) {
                            $skuQuery->where('id', '<>', $variant['id']);
                        }

                        if ($skuQuery->exists()) {
                            $validator->errors()->add("variants.{$index}.sku", 'Cette référence SKU est déjà utilisée.');
                        }
                    }
                }

                $this->validateProductImageOwnership($validator);
            },
        ];
    }

    private function validateProductImageOwnership(Validator $validator): void
    {
        $product = $this->route('product');
        $primaryImageId = $this->input('primary_image_id');

        if (
            $primaryImageId !== null
            && (! $product instanceof Product
                || ! ProductImage::query()
                    ->where('product_id', $product->getKey())
                    ->whereKey($primaryImageId)
                    ->exists())
        ) {
            $validator->errors()->add('primary_image_id', 'L’image principale ne correspond pas à ce produit.');
        }
    }
}
