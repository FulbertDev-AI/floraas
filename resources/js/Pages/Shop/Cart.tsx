import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { StoreLayout } from '../../Components/StoreLayout';

type CartItem = {
    product_id: number;
    variant_id: number | null;
    quantity: number;
    name: string;
    variant_name: string | null;
    variant_value: string | null;
    unit_price_minor: number | null;
    line_total_minor: number | null;
    currency: string | null;
    stock_quantity: number | null;
    is_available: boolean;
    image_url: string | null;
};

type Cart = {
    items: CartItem[];
    item_count: number;
    currency: string | null;
    subtotal_minor: number | null;
    can_checkout: boolean;
};

function formatPrice(amount: number | null, currency: string | null): string {
    if (amount === null || currency === null) {
        return 'À vérifier';
    }

    try {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100);
    } catch {
        return `${(amount / 100).toFixed(2)} ${currency}`;
    }
}

export default function CartPage({ cart }: { cart: Cart }) {
    return (
        <StoreLayout>
            <Head title="Mon panier" />
            <section className="mx-auto max-w-5xl px-5 py-10 sm:py-16 lg:px-10">
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Votre sélection</p>
                <h1 className="mt-2 font-display text-4xl sm:text-5xl">Panier</h1>
                {cart.items.length > 0 ? (
                    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
                        <ul className="divide-y divide-flora-line border-y border-flora-line">
                            {cart.items.map((item) => (
                                <CartRow item={item} key={`${item.product_id}-${item.variant_id ?? 0}`} />
                            ))}
                        </ul>
                        <aside className="h-fit border border-flora-line bg-white p-5">
                            <h2 className="font-display text-2xl">Résumé</h2>
                            <p className="mt-5 flex justify-between gap-4 text-sm">
                                <span>Sous-total</span>
                                <span>{formatPrice(cart.subtotal_minor, cart.currency)}</span>
                            </p>
                            <p className="mt-2 text-xs leading-5 text-flora-muted">
                                Les frais de livraison et les moyens de paiement seront indiqués lorsque la boutique sera configurée.
                            </p>
                            {!cart.can_checkout && (
                                <p className="mt-4 border-l-2 border-flora-accent pl-3 text-sm text-flora-accent-dark" role="status">
                                    Vérifiez les articles indisponibles ou les devises différentes avant de poursuivre.
                                </p>
                            )}
                            <Link
                                aria-disabled={!cart.can_checkout}
                                className={`mt-6 flex min-h-12 items-center justify-center px-4 text-center text-sm ${cart.can_checkout ? 'bg-flora-ink text-white hover:bg-flora-accent-dark' : 'pointer-events-none bg-flora-line text-flora-muted'}`}
                                href="/checkout"
                                tabIndex={cart.can_checkout ? 0 : -1}
                            >
                                Continuer
                            </Link>
                            <Link className="mt-4 block text-center text-sm underline underline-offset-4" href="/shop">
                                Continuer mes achats
                            </Link>
                        </aside>
                    </div>
                ) : (
                    <div className="mt-8 border-y border-flora-line py-14 text-center">
                        <p className="font-display text-2xl">Votre panier est vide</p>
                        <Link className="mt-5 inline-flex min-h-11 items-center bg-flora-ink px-5 text-sm text-white" href="/shop">
                            Découvrir la boutique
                        </Link>
                    </div>
                )}
            </section>
        </StoreLayout>
    );
}

function CartRow({ item }: { item: CartItem }) {
    const quantityForm = useForm({
        variant_id: item.variant_id,
        quantity: item.quantity,
    });
    const updateUrl = `/cart/items/${item.product_id}`;

    function updateQuantity(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        quantityForm.patch(updateUrl, { preserveScroll: true });
    }

    return (
        <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start">
            <div className="h-28 w-24 shrink-0 overflow-hidden bg-[#eee7df]">
                {item.image_url && <img alt="" className="h-full w-full object-cover" src={item.image_url} />}
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-medium">{item.name}</p>
                {item.variant_value && <p className="mt-1 text-sm text-flora-muted">{item.variant_name}: {item.variant_value}</p>}
                <p className="mt-2 text-sm">{formatPrice(item.unit_price_minor, item.currency)}</p>
                {!item.is_available && (
                    <p className="mt-2 text-sm text-red-800" role="status">Cet article n’est plus disponible dans la quantité choisie.</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    <form className="flex items-center gap-2" onSubmit={updateQuantity}>
                        <label className="sr-only" htmlFor={`quantity-${item.product_id}-${item.variant_id ?? 0}`}>Quantité de {item.name}</label>
                        <input
                            className="h-10 w-20 border border-flora-line px-2"
                            id={`quantity-${item.product_id}-${item.variant_id ?? 0}`}
                            max={Math.max(item.stock_quantity ?? 99, 1)}
                            min={1}
                            onChange={(event) => quantityForm.setData('quantity', Number(event.target.value))}
                            type="number"
                            value={quantityForm.data.quantity}
                        />
                        <button className="text-sm underline underline-offset-4" disabled={quantityForm.processing} type="submit">Mettre à jour</button>
                    </form>
                    <button
                        className="text-sm text-flora-muted underline underline-offset-4"
                        onClick={() => router.delete(updateUrl, { data: { variant_id: item.variant_id }, preserveScroll: true })}
                        type="button"
                    >
                        Supprimer
                    </button>
                </div>
                {quantityForm.errors.quantity && <p className="mt-2 text-sm text-red-800">{quantityForm.errors.quantity}</p>}
            </div>
            <p className="text-sm font-medium sm:text-right">{formatPrice(item.line_total_minor, item.currency)}</p>
        </li>
    );
}
