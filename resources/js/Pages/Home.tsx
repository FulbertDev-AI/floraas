import { Head, Link } from '@inertiajs/react';
import { ProductCard } from '../Components/ProductCard';
import { StoreLayout } from '../Components/StoreLayout';
import { StoreIcon } from '../Components/StoreIcon';
import type { CategorySummary, ProductSummary } from '../types';

type HomeProps = {
    categories: CategorySummary[];
    featuredProducts: ProductSummary[];
    newProducts: ProductSummary[];
    homepage: {
        hero_eyebrow: string;
        hero_title: string;
        hero_description: string | null;
        hero_button_text: string;
        hero_button_url: string;
        hero_image_url: string | null;
        hero_image_alt: string;
        hero_image_position: string;
        hero_visible: boolean;
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
            {homepage.hero_visible && (
                <section aria-labelledby="homepage-hero-title" className="relative isolate flex min-h-[570px] items-center overflow-hidden bg-[#eee4dc] sm:min-h-[620px] lg:min-h-[680px]">
                    {homepage.hero_image_url ? (
                        <img
                            alt={homepage.hero_image_alt}
                            className="absolute inset-0 h-full w-full object-cover"
                            fetchPriority="high"
                            src={homepage.hero_image_url}
                            style={{ objectPosition: homepage.hero_image_position }}
                        />
                    ) : (
                        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
                            <div className="absolute -right-24 top-[-16%] h-[125%] w-[70%] rounded-[48%] bg-[#d6bcae]" />
                            <div className="absolute right-[8%] top-[13%] h-[74%] w-[48%] rounded-[45%] border border-white/60 bg-[#e5d3c9]" />
                            <div className="absolute right-[23%] top-[24%] h-[62%] w-[34%] rounded-[46%] bg-[#c49d88]/50" />
                        </div>
                    )}
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#f8f3ee]/95 via-[#f8f3ee]/82 to-[#f8f3ee]/10 md:via-[#f8f3ee]/70" />
                    <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-16 sm:py-20 lg:px-10">
                        <div className="max-w-xl">
                            <p className="hero-reveal text-[11px] font-medium uppercase tracking-[0.24em] text-flora-accent">
                                {homepage.hero_eyebrow}
                            </p>
                            <h1
                                className="hero-reveal mt-5 max-w-[12ch] font-display text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
                                id="homepage-hero-title"
                                style={{ animationDelay: '100ms' }}
                            >
                                {homepage.hero_title}
                            </h1>
                            {homepage.hero_description && (
                                <p className="hero-reveal mt-6 max-w-md text-base leading-7 text-flora-muted sm:text-lg" style={{ animationDelay: '180ms' }}>
                                    {homepage.hero_description}
                                </p>
                            )}
                            <Link
                                className="hero-reveal mt-8 inline-flex min-h-12 items-center gap-4 bg-flora-ink px-6 text-sm text-white transition-colors hover:bg-flora-accent-dark focus-visible:outline-white"
                                href={homepage.hero_button_url}
                                style={{ animationDelay: '260ms' }}
                            >
                                {homepage.hero_button_text}
                                <StoreIcon className="h-4 w-4" name="arrow" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

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
