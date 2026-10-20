<?php

namespace App\Http\Resources\Storefront;

use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductCardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var ProductImage|null $image */
        $image = $this->resource->relationLoaded('primaryImage')
            ? $this->resource->getRelation('primaryImage')
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'price_minor' => $this->price_minor,
            'compare_at_minor' => $this->compare_at_minor,
            'currency' => $this->currency,
            'stock_quantity' => $this->stock_quantity,
            'is_new' => $this->is_new,
            'primary_image' => $image ? [
                'id' => $image->id,
                'url' => Storage::disk('public')->url($image->path),
                'alt_text' => $image->alt_text,
                'is_primary' => $image->is_primary,
            ] : null,
        ];
    }
}
