import { Head, Link } from '@inertiajs/react';
import { ProductCard } from '../../Components/ProductCard';
import { StoreLayout } from '../../Components/StoreLayout';
import type { CategorySummary, ProductSummary } from '../../types';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type ListingProps = {
    title: string;
    context: CategorySummary | { name: string; description: string | null } | null;
    products: {
        data: ProductSummary[];
        links: PaginationLink[];
        total: number;
    };
    filters: {
        q: string;
        sort: string;
        in_stock: boolean;
        category: string;
        on_sale: boolean;
    };
};

export default function Index({ title, context, products, filters }: ListingProps) {
    return (
        <StoreLayout>
            <Head title={title}>
                <meta
                    content={context && 'description' in context && context.description
                        ? context.description
                        : 'Découvrez les produits de la boutique FLORAA’S.'}
                    name="description"
                />
                <meta content="website" property="og:type" />
            </Head>
            <section className="mx-auto max-w-7xl px-5 py-10 sm:py-16 lg:px-10">
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">FLORAA’S</p>
                <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
                {context && 'description' in context && context.description && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-flora-muted">{context.description}</p>
                )}

                <form
                    action={typeof window === 'undefined' ? '/shop' : window.location.pathname}
                    className="mt-8 grid gap-3 border-y border-flora-line py-4 sm:grid-cols-[1fr_200px_auto_auto_auto] sm:items-end"
                    method="get"
                >
                    {filters.category && <input name="category" type="hidden" value={filters.category} />}
                    <label className="grid gap-1 text-xs text-flora-muted">
                        Rechercher
                        <input
                            className="min-h-11 border border-flora-line bg-white px-3 text-sm text-flora-ink"
                            defaultValue={filters.q}
                            maxLength={100}
                            name="q"
                            placeholder="Nom, description ou référence"
                            type="search"
                        />
                    </label>
                    <label className="grid gap-1 text-xs text-flora-muted">
                        Trier par
                        <select
                            className="min-h-11 border border-flora-line bg-white px-3 text-sm text-flora-ink"
                            defaultValue={filters.sort}
                            name="sort"
                        >
                            <option value="relevance">Pertinence</option>
                            <option value="newest">Nouveautés</option>
                            <option value="price_asc">Prix croissant</option>
                            <option value="price_desc">Prix décroissant</option>
                        </select>
                    </label>
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                        <input defaultChecked={filters.in_stock} name="in_stock" type="checkbox" value="1" />
                        En stock
                    </label>
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                        <input defaultChecked={filters.on_sale} name="on_sale" type="checkbox" value="1" />
                        En promotion
                    </label>
                    <button className="min-h-11 bg-flora-ink px-5 text-sm text-white hover:bg-flora-accent-dark" type="submit">
                        Appliquer
                    </button>
                </form>

                <p aria-live="polite" className="py-5 text-sm text-flora-muted">
                    {products.total} {products.total > 1 ? 'produits' : 'produit'}
                </p>
                {products.data.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
                        {products.data.map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                ) : (
                    <p className="border-y border-flora-line py-12 text-center text-sm text-flora-muted">
                        Aucun produit ne correspond à votre recherche.
                    </p>
                )}
                {products.links.length > 3 && (
                    <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2">
                        {products.links.map((link, index) => link.url ? (
                            <Link
                                aria-current={link.active ? 'page' : undefined}
                                className={`min-w-10 border px-3 py-2 text-center text-sm ${link.active ? 'border-flora-ink bg-flora-ink text-white' : 'border-flora-line hover:border-flora-ink'}`}
                                href={link.url}
                                key={`${link.label}-${index}`}
                                preserveScroll
                            >
                                {link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}
                            </Link>
                        ) : (
                            <span
                                aria-disabled="true"
                                className="min-w-10 border border-flora-line px-3 py-2 text-center text-sm text-flora-muted/60"
                                key={`${link.label}-${index}`}
                            >
                                {link.label.replace('&laquo;', '‹').replace('&raquo;', '›')}
                            </span>
                        ))}
                    </nav>
                )}
            </section>
        </StoreLayout>
    );
}
