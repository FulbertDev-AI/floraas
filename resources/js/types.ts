export type ProductImage = {
    id: number;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
};

export type ProductSummary = {
    id: number;
    name: string;
    slug: string;
    short_description: string | null;
    price_minor: number | null;
    compare_at_minor: number | null;
    currency: string | null;
    stock_quantity: number;
    is_new: boolean;
    primary_image: ProductImage | null;
};

export type CategorySummary = {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
};
