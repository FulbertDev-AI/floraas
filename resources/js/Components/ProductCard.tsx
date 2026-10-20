import { Link } from '@inertiajs/react';
import type { ProductSummary } from '../types';

function formatPrice(amount: number | null, currency: string | null): string {
    if (amount === null || currency === null) {
        return 'Prix à configurer';
    }

    try {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency,
        }).format(amount / 100);
    } catch {
        return `${(amount / 100).toFixed(2)} ${currency}`;
    }
}

export function ProductCard({ product }: { product: ProductSummary }) {
    const hasDiscount = product.compare_at_minor !== null
        && product.price_minor !== null
        && product.compare_at_minor > product.price_minor;

    return (
        <article className="group min-w-0">
            <Link className="block" href={`/products/${product.slug}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-[#eee7df]">
                    {product.primary_image ? (
                        <img
                            alt={product.primary_image.alt_text ?? product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                            loading="lazy"
                            src={product.primary_image.url}
                        />
                    ) : (
                        <div aria-label="Image à ajouter depuis l’administration" className="flex h-full items-center justify-center px-6 text-center">
                            <span className="font-display text-2xl text-flora-muted">FLORAA’S</span>
                        </div>
                    )}
                    {product.is_new && (
                        <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.12em]">
                            Nouveau
                        </span>
                    )}
                </div>
                <div className="pt-4">
                    <h3 className="text-sm font-medium sm:text-base">{product.name}</h3>
                    {product.short_description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-flora-muted">
                            {product.short_description}
                        </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm">
                        <span>{formatPrice(product.price_minor, product.currency)}</span>
                        {hasDiscount && (
                            <del className="text-flora-muted">
                                {formatPrice(product.compare_at_minor, product.currency)}
                            </del>
                        )}
                    </div>
                </div>
            </Link>
        </article>
    );
}
