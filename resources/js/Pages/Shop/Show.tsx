import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { StoreLayout } from '../../Components/StoreLayout';
import type { ProductImage, ProductSummary } from '../../types';

type Variant = {
    id: number;
    option_name: string;
    option_value: string;
    price_minor: number | null;
    stock_quantity: number;
};

type ProductDetails = ProductSummary & {
    description: string | null;
    images: ProductImage[];
    variants: Variant[];
    canonical_url: string;
    primary_image_url: string | null;
    structured_data: string;
};

function formatPrice(amount: number | null, currency: string | null): string {
    if (amount === null || currency === null) {
        return 'Prix à configurer';
    }

    try {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100);
    } catch {
        return `${(amount / 100).toFixed(2)} ${currency}`;
    }
}

export default function Show({ product }: { product: ProductDetails }) {
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const form = useForm({
        product_id: product.id,
        variant_id: null as number | null,
        quantity: 1,
    });
    const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
    const images = product.images.length > 0 ? product.images : [];
    const activeProductPrice = selectedVariant?.price_minor ?? product.price_minor;
    const availableStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
    const hasVariantSelection = product.variants.length === 0 || selectedVariant !== undefined;
    const canAddToCart = product.currency !== null && activeProductPrice !== null
        && availableStock > 0 && hasVariantSelection;

    function addToCart(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.transform((data) => ({ ...data, variant_id: selectedVariantId }));
        form.post('/cart/items');
    }

    return (
        <StoreLayout>
            <Head title={product.name}>
                <meta content={product.short_description ?? product.name} name="description" />
                <link href={product.canonical_url} rel="canonical" />
                <meta content={product.name} property="og:title" />
                <meta content={product.short_description ?? product.name} property="og:description" />
                <meta content={product.canonical_url} property="og:url" />
                <meta content="product" property="og:type" />
                {product.primary_image_url && <meta content={product.primary_image_url} property="og:image" />}
                <script dangerouslySetInnerHTML={{ __html: product.structured_data }} type="application/ld+json" />
            </Head>
            <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
                <nav aria-label="Fil d’Ariane" className="mb-8 text-xs text-flora-muted">
                    <Link href="/">Accueil</Link><span className="px-2">/</span>
                    <Link href="/shop">Boutique</Link><span className="px-2">/</span>
                    <span aria-current="page" className="text-flora-ink">{product.name}</span>
                </nav>
                <div className="grid gap-8 md:grid-cols-2 md:gap-14">
                    <div>
                        {images.length > 0 ? (
                            <>
                                <div className="aspect-[4/5] overflow-hidden bg-[#eee7df]">
                                    <img
                                        alt={images[activeImage]?.alt_text ?? product.name}
                                        className="h-full w-full object-cover"
                                        src={images[activeImage]?.url}
                                    />
                                </div>
                                {images.length > 1 && (
                                    <div aria-label="Galerie du produit" className="mt-3 grid grid-cols-5 gap-2">
                                        {images.map((image, index) => (
                                            <button
                                                aria-label={`Afficher l’image ${index + 1}`}
                                                aria-pressed={activeImage === index}
                                                className={`aspect-square overflow-hidden border ${activeImage === index ? 'border-flora-ink' : 'border-transparent'}`}
                                                key={image.id}
                                                onClick={() => setActiveImage(index)}
                                                type="button"
                                            >
                                                <img alt="" className="h-full w-full object-cover" loading="lazy" src={image.url} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div aria-label="Aucune image de produit publiée" className="flex aspect-[4/5] items-center justify-center bg-[#eee7df]">
                                <span className="font-display text-3xl text-flora-muted">FLORAA’S</span>
                            </div>
                        )}
                    </div>
                    <div className="py-2 md:py-8">
                        <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">FLORAA’S</p>
                        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{product.name}</h1>
                        {product.short_description && (
                            <p className="mt-4 text-base leading-7 text-flora-muted">{product.short_description}</p>
                        )}
                        <div className="mt-5 text-lg">
                            {formatPrice(activeProductPrice, product.currency)}
                        </div>
                        <p className={`mt-3 text-sm ${availableStock > 0 ? 'text-flora-muted' : 'text-red-800'}`}>
                            {availableStock > 0 ? 'En stock' : 'Indisponible'}
                        </p>

                        {product.variants.length > 0 && (
                            <label className="mt-7 grid gap-2 text-sm">
                                {product.variants[0].option_name}
                                <select
                                    className="min-h-12 border border-flora-line bg-white px-3"
                                    onChange={(event) => setSelectedVariantId(event.target.value ? Number(event.target.value) : null)}
                                    value={selectedVariantId ?? ''}
                                >
                                    <option value="">Choisir une option</option>
                                    {product.variants.map((variant) => (
                                        <option disabled={variant.stock_quantity < 1} key={variant.id} value={variant.id}>
                                            {variant.option_value}{variant.stock_quantity < 1 ? ' — indisponible' : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}

                        <form className="mt-6 grid gap-3" onSubmit={addToCart}>
                            <label className="grid max-w-32 gap-2 text-sm">
                                Quantité
                                <input
                                    className="min-h-12 border border-flora-line bg-white px-3"
                                    max={Math.max(availableStock, 1)}
                                    min={1}
                                    onChange={(event) => form.setData('quantity', Number(event.target.value))}
                                    type="number"
                                    value={form.data.quantity}
                                />
                            </label>
                            <button
                                className="min-h-12 w-full bg-flora-ink px-6 text-sm text-white transition-colors hover:bg-flora-accent-dark disabled:cursor-not-allowed disabled:bg-flora-muted"
                                disabled={!canAddToCart || form.processing}
                                type="submit"
                            >
                                {form.processing ? 'Ajout…' : 'Ajouter au panier'}
                            </button>
                            {form.errors.product_id && <p className="text-sm text-red-800">{form.errors.product_id}</p>}
                            {form.errors.variant_id && <p className="text-sm text-red-800">{form.errors.variant_id}</p>}
                            {form.errors.quantity && <p className="text-sm text-red-800">{form.errors.quantity}</p>}
                        </form>

                        {product.description && (
                            <section className="mt-10 border-t border-flora-line pt-6">
                                <h2 className="font-display text-2xl">Détails</h2>
                                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-flora-muted">{product.description}</p>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
