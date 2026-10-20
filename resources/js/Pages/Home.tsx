import { Head, Link } from '@inertiajs/react';
import { ProductCard } from '../Components/ProductCard';
import { StoreLayout } from '../Components/StoreLayout';
import type { CategorySummary, ProductSummary } from '../types';

type HomeProps = {
    categories: CategorySummary[];
    featuredProducts: ProductSummary[];
    newProducts: ProductSummary[];
    homepage: {
        hero_title: string;
        hero_description: string | null;
        hero_button_text: string;
        hero_button_url: string;
        hero_image_url: string | null;
        brand_story: string;
        show_categories: boolean;
        show_featured_products: boolean;
        show_new_products: boolean;
        show_brand_story: boolean;
    };
};

export default function Home({ categories, featuredProducts, newProducts, homepage }: HomeProps) {
    return (
        <StoreLayout>
            <Head title="Accueil">
                <meta content={homepage.hero_description ?? 'Découvrez la sélection FLORAA’S.'} name="description" />
                <meta content="website" property="og:type" />
            </Head>
            <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-10 md:grid-cols-[1fr_0.9fr] md:items-center md:gap-14 md:pb-24 md:pt-16 lg:px-10">
                <div className="max-w-xl py-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-flora-accent">Bienvenue chez FLORAA’S</p>
                    <h1 className="mt-5 font-display text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">{homepage.hero_title}</h1>
                    {homepage.hero_description && (
                        <p className="mt-6 max-w-md text-base leading-7 text-flora-muted">{homepage.hero_description}</p>
                    )}
                    <Link
                        className="mt-8 inline-flex min-h-12 items-center justify-center bg-flora-ink px-7 text-sm text-white transition-colors hover:bg-flora-accent-dark"
                        href={homepage.hero_button_url}
                    >
                        {homepage.hero_button_text}
                    </Link>
                </div>
                <div className="relative aspect-[5/4] overflow-hidden bg-[#e9ded3]">
                    {homepage.hero_image_url ? (
                        <img alt="" className="h-full w-full object-cover" src={homepage.hero_image_url} />
                    ) : (
                        <>
                            <div aria-hidden="true" className="absolute inset-[8%] border border-white/70" />
                            <div aria-hidden="true" className="absolute -right-12 -top-14 h-64 w-64 rounded-full bg-[#d2b9a7]/70 blur-2xl" />
                            <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[#b58c75]/35 blur-3xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="max-w-xs px-8 text-center font-display text-4xl leading-tight text-flora-ink/85 sm:text-5xl">
                                    FLORAA’S
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {homepage.show_categories && categories.length > 0 && (
                <section className="border-y border-flora-line bg-white/50 py-14 sm:py-20">
                    <div className="mx-auto max-w-7xl px-5 lg:px-10">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">À découvrir</p>
                                <h2 className="mt-2 font-display text-3xl sm:text-4xl">Nos univers</h2>
                            </div>
                            <Link className="text-sm underline underline-offset-4" href="/shop">Tout voir</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                            {categories.map((category) => (
                                <Link className="group" href={`/categories/${category.slug}`} key={category.id}>
                                    <div className="aspect-[4/3] overflow-hidden bg-[#eee7df]">
                                        {category.image_url ? (
                                            <img
                                                alt=""
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                loading="lazy"
                                                src={category.image_url}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center font-display text-xl text-flora-muted">
                                                FLORAA’S
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="mt-3 text-sm tracking-wide">{category.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {homepage.show_featured_products && (
                <ProductSection description="Une sélection choisie pour vous." products={featuredProducts} title="À la une" />
            )}
            {homepage.show_new_products && (
                <ProductSection description="Les dernières références ajoutées au catalogue." products={newProducts} title="Nouveautés" />
            )}
            {homepage.show_brand_story && homepage.brand_story && (
                <section className="border-y border-flora-line bg-white/50 py-14 sm:py-20">
                    <div className="mx-auto max-w-3xl px-5 text-center">
                        <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">La maison</p>
                        <h2 className="mt-3 font-display text-3xl sm:text-4xl">À propos de FLORAA’S</h2>
                        <p className="mt-5 whitespace-pre-line text-sm leading-7 text-flora-muted">{homepage.brand_story}</p>
                    </div>
                </section>
            )}
        </StoreLayout>
    );
}

function ProductSection({
    description,
    products,
    title,
}: {
    description: string;
    products: ProductSummary[];
    title: string;
}) {
    return (
        <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-10">
            <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">{description}</p>
                    <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
                </div>
                <Link className="shrink-0 text-sm underline underline-offset-4" href="/shop">
                    Voir tout
                </Link>
            </div>
            {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
            ) : (
                <p className="border-y border-flora-line py-8 text-sm text-flora-muted">
                    Les produits apparaîtront ici dès leur publication depuis l’administration.
                </p>
            )}
        </section>
    );
}
