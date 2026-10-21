import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import type { CategorySummary } from '../types';
import { StoreIcon } from './StoreIcon';

type StoreUser = {
    name: string;
    role: string;
};

type SharedProps = {
    auth?: {
        user?: StoreUser | null;
    };
    navigation_categories?: CategorySummary[];
    cart_count?: number;
    announcement?: {
        enabled: boolean;
        text: string;
    } | null;
    store_contact?: {
        location: string;
        phone: string;
        email: string;
        hours: string;
    };
};

const navigationCategories = {
    makeup: ['makeup', 'maquillage'],
    skincare: ['skincare', 'skin-care', 'soins'],
    haircare: ['haircare', 'hair-care', 'cheveux'],
    fragrance: ['fragrance', 'parfum'],
};

function normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findCategory(categories: CategorySummary[], aliases: string[]): CategorySummary | undefined {
    const roots = categories.filter((category) => category.parent_id === null);
    const exactMatch = roots.find((category) => aliases.some((alias) =>
        normalize(category.slug) === alias || normalize(category.name) === alias));

    return exactMatch ?? roots.find((category) => aliases.some((alias) =>
        normalize(category.slug).includes(alias) || normalize(category.name).includes(alias)));
}

function categoryUrl(category: CategorySummary | undefined, fallback: string): string {
    return category ? `/categories/${category.slug}` : `/shop?category=${fallback}`;
}

export function StoreLayout({ children }: { children: ReactNode }) {
    const { props, url } = usePage<SharedProps>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const categories = props.navigation_categories ?? [];
    const announcement = props.announcement;
    const user = props.auth?.user;
    const cartCount = props.cart_count ?? 0;
    const contact = props.store_contact ?? { location: 'Lomé, Togo', phone: '', email: '', hours: '' };
    const accountUrl = user ? '/account' : '/login';
    const makeup = findCategory(categories, navigationCategories.makeup);
    const skincare = findCategory(categories, navigationCategories.skincare);
    const haircare = findCategory(categories, navigationCategories.haircare);
    const fragrance = findCategory(categories, navigationCategories.fragrance);

    useEffect(() => {
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setOpenMenu(null);
                setIsMenuOpen(false);
                setIsSearchOpen(false);
            }
        }

        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, []);

    function closeNavigation() {
        setIsMenuOpen(false);
        setOpenMenu(null);
    }

    return (
        <div className="min-h-screen bg-flora-paper text-flora-ink">
            {announcement?.enabled && announcement.text && (
                <div className="bg-flora-ink px-4 py-2 text-center text-xs tracking-wide text-white sm:text-sm">
                    {announcement.text}
                </div>
            )}
            <header className="sticky top-0 z-30 border-b border-flora-line bg-flora-paper/95 backdrop-blur">
                <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-9">
                    <Link
                        aria-label="FLORAA’S — Accueil"
                        className="shrink-0 font-display text-xl tracking-[0.1em] sm:text-2xl"
                        href="/"
                        onClick={closeNavigation}
                    >
                        FLORAA’S
                    </Link>

                    <nav aria-label="Navigation principale" className="hidden items-center gap-4 xl:flex 2xl:gap-6">
                        <Link aria-current={isCurrentPage(url, '/') ? 'page' : undefined} className="store-nav-link" href="/" onClick={closeNavigation}>Accueil</Link>
                        <Link aria-current={isCurrentPage(url, '/shop') ? 'page' : undefined} className="store-nav-link" href="/shop" onClick={closeNavigation}>Boutique</Link>
                        <DesktopCategoryMenu
                            categories={categories}
                            category={skincare}
                            fallback="skincare"
                            label="Skincare"
                            onClose={() => setOpenMenu(null)}
                            onOpen={() => setOpenMenu('skincare')}
                            onToggle={() => setOpenMenu('skincare')}
                            open={openMenu === 'skincare'}
                            currentUrl={url}
                        />
                        <DesktopCategoryMenu
                            categories={categories}
                            category={makeup}
                            fallback="makeup"
                            label="Makeup"
                            onClose={() => setOpenMenu(null)}
                            onOpen={() => setOpenMenu('makeup')}
                            onToggle={() => setOpenMenu('makeup')}
                            open={openMenu === 'makeup'}
                            currentUrl={url}
                        />
                        <Link aria-current={isCurrentPage(url, categoryUrl(haircare, 'haircare')) ? 'page' : undefined} className="store-nav-link" href={categoryUrl(haircare, 'haircare')} onClick={closeNavigation}>Haircare</Link>
                        <Link aria-current={isCurrentPage(url, categoryUrl(fragrance, 'fragrance')) ? 'page' : undefined} className="store-nav-link" href={categoryUrl(fragrance, 'fragrance')} onClick={closeNavigation}>Fragrance</Link>
                        <Link aria-current={isCurrentPage(url, '/shop?sort=newest') ? 'page' : undefined} className="store-nav-link" href="/shop?sort=newest" onClick={closeNavigation}>Nouveautés</Link>
                        <Link aria-current={isCurrentPage(url, '/shop?on_sale=1') ? 'page' : undefined} className="store-nav-link" href="/shop?on_sale=1" onClick={closeNavigation}>Offres</Link>
                    </nav>

                    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                        {user?.role === 'admin' && (
                            <Link
                                className="hidden min-h-10 items-center px-2 text-xs transition-colors hover:text-flora-accent xl:inline-flex"
                                href="/admin"
                            >
                                Administration
                            </Link>
                        )}
                        <button
                            aria-expanded={isSearchOpen}
                            aria-label={isSearchOpen ? 'Fermer la recherche' : 'Rechercher'}
                            className="inline-flex h-10 w-10 items-center justify-center hover:text-flora-accent"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            type="button"
                        >
                            <StoreIcon name={isSearchOpen ? 'close' : 'search'} />
                        </button>
                        <Link
                            aria-label={user ? 'Mon compte' : 'Se connecter'}
                            className="inline-flex h-10 w-10 items-center justify-center hover:text-flora-accent"
                            href={accountUrl}
                        >
                            <StoreIcon name="account" />
                        </Link>
                        <Link
                            aria-label={`Voir le panier${cartCount > 0 ? `, ${cartCount} article(s)` : ''}`}
                            className="relative inline-flex h-10 w-10 items-center justify-center hover:text-flora-accent"
                            href="/cart"
                        >
                            <StoreIcon name="bag" />
                            {cartCount > 0 && (
                                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-flora-ink px-1 text-[10px] leading-none text-white">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </Link>
                        {user && (
                            <Link
                                aria-label="Déconnexion"
                                className="hidden h-10 w-10 items-center justify-center hover:text-flora-accent xl:inline-flex"
                                href="/logout"
                                method="post"
                                as="button"
                            >
                                <StoreIcon name="logout" />
                            </Link>
                        )}
                        <button
                            aria-controls="mobile-navigation"
                            aria-expanded={isMenuOpen}
                            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                            className="inline-flex h-10 w-10 items-center justify-center hover:text-flora-accent xl:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            type="button"
                        >
                            <StoreIcon name={isMenuOpen ? 'close' : 'menu'} />
                        </button>
                    </div>
                </div>

                {isSearchOpen && (
                    <form action="/shop" className="mx-auto flex max-w-7xl gap-3 border-t border-flora-line px-5 py-3 lg:px-10" method="get" role="search">
                        <label className="sr-only" htmlFor="store-search">Rechercher un produit</label>
                        <input
                            autoFocus
                            className="min-w-0 flex-1 border-b border-flora-line bg-transparent px-1 py-2 text-sm placeholder:text-flora-muted focus:border-flora-accent focus:outline-none"
                            id="store-search"
                            name="q"
                            placeholder="Rechercher un produit"
                            type="search"
                        />
                        <button className="text-sm underline underline-offset-4" type="submit">Rechercher</button>
                    </form>
                )}

                {isMenuOpen && (
                    <nav
                        aria-label="Navigation mobile"
                        className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-flora-line bg-flora-paper px-5 py-4 xl:hidden"
                        id="mobile-navigation"
                    >
                        <div className="mx-auto flex max-w-7xl flex-col divide-y divide-flora-line">
                            <MobileNavLink href="/" onNavigate={closeNavigation}>Accueil</MobileNavLink>
                            <MobileNavLink href="/shop" onNavigate={closeNavigation}>Boutique</MobileNavLink>
                            <MobileCategoryMenu
                                categories={categories}
                                category={skincare}
                                fallback="skincare"
                                label="Skincare"
                                onNavigate={closeNavigation}
                            />
                            <MobileCategoryMenu
                                categories={categories}
                                category={makeup}
                                fallback="makeup"
                                label="Makeup"
                                onNavigate={closeNavigation}
                            />
                            <MobileNavLink href={categoryUrl(haircare, 'haircare')} onNavigate={closeNavigation}>Haircare</MobileNavLink>
                            <MobileNavLink href={categoryUrl(fragrance, 'fragrance')} onNavigate={closeNavigation}>Fragrance</MobileNavLink>
                            <MobileNavLink href="/shop?sort=newest" onNavigate={closeNavigation}>Nouveautés</MobileNavLink>
                            <MobileNavLink href="/shop?on_sale=1" onNavigate={closeNavigation}>Offres</MobileNavLink>
                            {user?.role === 'admin' && <MobileNavLink href="/admin" onNavigate={closeNavigation}>Administration</MobileNavLink>}
                            {user && (
                                <Link
                                    as="button"
                                    className="py-3 text-left text-sm"
                                    href="/logout"
                                    method="post"
                                    onClick={closeNavigation}
                                >
                                    Déconnexion
                                </Link>
                            )}
                        </div>
                    </nav>
                )}
            </header>

            <main>{children}</main>

            <footer className="mt-20 border-t border-flora-line bg-[#f1ece5]">
                <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr] lg:px-10 lg:py-16">
                    <div>
                        <Link className="font-display text-2xl tracking-[0.14em]" href="/">FLORAA’S</Link>
                        <p className="mt-3 max-w-sm text-sm leading-6 text-flora-muted">
                            Une sélection de soins, maquillage et essentiels beauté à découvrir.
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xs uppercase tracking-[0.16em]">Navigation</h2>
                        <nav aria-label="Liens de pied de page" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                            <Link href="/">Accueil</Link>
                            <Link href="/shop">Boutique</Link>
                            <Link href={categoryUrl(skincare, 'skincare')}>Skincare</Link>
                            <Link href={categoryUrl(makeup, 'makeup')}>Makeup</Link>
                            <Link href={categoryUrl(haircare, 'haircare')}>Haircare</Link>
                            <Link href={categoryUrl(fragrance, 'fragrance')}>Fragrance</Link>
                            <Link href="/shop?sort=newest">Nouveautés</Link>
                            <Link href="/shop?on_sale=1">Offres</Link>
                        </nav>
                    </div>
                    <div>
                        <h2 className="text-xs uppercase tracking-[0.16em]">Nous trouver</h2>
                        <address className="mt-4 grid gap-2 text-sm not-italic text-flora-muted">
                            {contact.location && <p>{contact.location}</p>}
                            {contact.phone && <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`}>{contact.phone}</a>}
                            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
                            {contact.hours && <p className="whitespace-pre-line">{contact.hours}</p>}
                        </address>
                    </div>
                </div>
                <div className="border-t border-flora-line/80 px-5 py-4 text-center text-xs text-flora-muted">
                    © {new Date().getFullYear()} FLORAA’S
                </div>
            </footer>
        </div>
    );
}

function DesktopCategoryMenu({
    categories,
    category,
    fallback,
    label,
    onClose,
    onOpen,
    onToggle,
    open,
    currentUrl,
}: {
    categories: CategorySummary[];
    category: CategorySummary | undefined;
    fallback: string;
    label: string;
    onClose: () => void;
    onOpen: () => void;
    onToggle: () => void;
    open: boolean;
    currentUrl: string;
}) {
    const children = category ? categories.filter((item) => item.parent_id === category.id) : [];

    return (
        <div
            className="relative flex items-center gap-0.5"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    onClose();
                }
            }}
            onMouseEnter={onOpen}
            onMouseLeave={onClose}
        >
            <Link
                aria-current={isCurrentPage(currentUrl, categoryUrl(category, fallback)) ? 'page' : undefined}
                className="store-nav-link"
                href={categoryUrl(category, fallback)}
                onClick={onClose}
            >
                {label}
            </Link>
            {children.length > 0 && (
                <>
                    <button
                        aria-expanded={open}
                        aria-label={open ? `Menu ${label} ouvert` : `Ouvrir le menu ${label}`}
                        className="inline-flex h-8 w-7 items-center justify-center"
                        onClick={onToggle}
                        onFocus={onOpen}
                        type="button"
                    >
                        <StoreIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} name="chevron" />
                    </button>
                    {open && (
                        <div className="absolute left-0 top-full z-40 min-w-52 max-w-[calc(100vw-2rem)] border border-flora-line bg-white p-2 shadow-lg shadow-flora-ink/5">
                            {children.map((child) => (
                                <Link
                                    className="block px-4 py-3 text-sm transition-colors hover:bg-flora-paper hover:text-flora-accent"
                                    href={`/categories/${child.slug}`}
                                    key={child.id}
                                    onClick={onClose}
                                    aria-current={isCurrentPage(currentUrl, `/categories/${child.slug}`) ? 'page' : undefined}
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function MobileNavLink({ children, href, onNavigate }: { children: ReactNode; href: string; onNavigate: () => void }) {
    return <Link className="py-3 text-sm" href={href} onClick={onNavigate}>{children}</Link>;
}

function isCurrentPage(currentUrl: string, href: string): boolean {
    if (href.includes('?')) {
        return currentUrl === href;
    }

    return currentUrl.split('?')[0] === href;
}

function MobileCategoryMenu({
    categories,
    category,
    fallback,
    label,
    onNavigate,
}: {
    categories: CategorySummary[];
    category: CategorySummary | undefined;
    fallback: string;
    label: string;
    onNavigate: () => void;
}) {
    const [open, setOpen] = useState(false);
    const children = category ? categories.filter((item) => item.parent_id === category.id) : [];

    return (
        <div className="py-1">
            <div className="flex items-center justify-between gap-4">
                <Link className="py-2 text-sm" href={categoryUrl(category, fallback)} onClick={onNavigate}>{label}</Link>
                {children.length > 0 && (
                    <button
                        aria-expanded={open}
                        className="inline-flex min-h-10 min-w-10 items-center justify-center"
                        onClick={() => setOpen(!open)}
                        type="button"
                    >
                        <span className="sr-only">{open ? 'Masquer' : 'Afficher'} les catégories {label}</span>
                        <StoreIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} name="chevron" />
                    </button>
                )}
            </div>
            {open && (
                <div className="mb-2 ml-4 grid border-l border-flora-line pl-3">
                    {children.map((child) => (
                        <Link
                            className="py-2.5 text-sm text-flora-muted"
                            href={`/categories/${child.slug}`}
                            key={child.id}
                            onClick={onNavigate}
                        >
                            {child.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
