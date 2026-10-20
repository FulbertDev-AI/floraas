import { Head, Link, useForm } from '@inertiajs/react';
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

export default function Checkout({ cart, submissionKey }: { cart?: Cart; submissionKey: string }) {
    const checkout = cart ?? {
        items: [],
        item_count: 0,
        currency: null,
        subtotal_minor: null,
        can_checkout: false,
    };

    const form = useForm({
        contact_name: '',
        email: '',
        phone: '',
        understands_unconfirmed: false,
        submission_key: submissionKey,
    });

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/checkout');
    }

    return (
        <StoreLayout>
            <Head title="Finaliser la demande" />
            <section className="mx-auto max-w-6xl px-5 py-10 sm:py-16 lg:px-10">
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Commande</p>
                <h1 className="mt-2 font-display text-4xl sm:text-5xl">Finaliser ma demande</h1>

                {checkout.items.length > 0 ? (
                    <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <form className="border border-flora-line bg-white p-5 sm:p-7" onSubmit={handleSubmit}>
                            <input name="submission_key" type="hidden" value={form.data.submission_key} />
                            <h2 className="font-display text-2xl">Coordonnées</h2>
                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                                    <span>Nom complet</span>
                                    <input
                                        className="h-11 border border-flora-line px-3"
                                        onChange={(event) => form.setData('contact_name', event.target.value)}
                                        required
                                        type="text"
                                        value={form.data.contact_name}
                                    />
                                </label>
                                {form.errors.contact_name && <p className="text-sm text-red-800 sm:col-span-2">{form.errors.contact_name}</p>}
                                <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                                    <span>E-mail</span>
                                    <input
                                        className="h-11 border border-flora-line px-3"
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        required
                                        type="email"
                                        value={form.data.email}
                                    />
                                </label>
                                {form.errors.email && <p className="text-sm text-red-800 sm:col-span-2">{form.errors.email}</p>}
                                <label className="flex flex-col gap-2 text-sm sm:col-span-2">
                                    <span>Téléphone (optionnel)</span>
                                    <input
                                        className="h-11 border border-flora-line px-3"
                                        onChange={(event) => form.setData('phone', event.target.value)}
                                        type="tel"
                                        value={form.data.phone}
                                    />
                                </label>
                                {form.errors.phone && <p className="text-sm text-red-800 sm:col-span-2">{form.errors.phone}</p>}
                            </div>

                            <div className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                <p className="font-medium">Cette demande n’est pas une commande payée.</p>
                                <p className="mt-2">
                                    FLORAA’S n’a pas encore configuré le paiement et la livraison. La demande est enregistrée comme non confirmée jusqu’à validation du commerce.
                                </p>
                            </div>

                            <label className="mt-6 flex items-start gap-3 text-sm text-flora-muted">
                                <input
                                    checked={form.data.understands_unconfirmed}
                                    className="mt-1 h-4 w-4"
                                    onChange={(event) => form.setData('understands_unconfirmed', event.target.checked)}
                                    type="checkbox"
                                />
                                <span>Je confirme qu’il s’agit d’une demande non confirmée et que sa validation commerciale reste à définir.</span>
                            </label>
                            {form.errors.understands_unconfirmed && (
                                <p className="mt-3 text-sm text-red-800">{form.errors.understands_unconfirmed}</p>
                            )}
                            {form.errors.submission_key && (
                                <p className="mt-3 text-sm text-red-800">{form.errors.submission_key}</p>
                            )}

                            <button
                                className="mt-6 inline-flex min-h-12 items-center justify-center bg-flora-ink px-5 text-sm text-white disabled:cursor-not-allowed disabled:bg-flora-line disabled:text-flora-muted"
                                disabled={form.processing || !form.data.understands_unconfirmed}
                                type="submit"
                            >
                                Envoyer la demande
                            </button>
                        </form>

                        <aside className="h-fit border border-flora-line bg-white p-5 sm:p-6">
                            <h2 className="font-display text-2xl">Résumé</h2>
                            <ul className="mt-5 divide-y divide-flora-line">
                                {checkout.items.map((item) => (
                                    <li className="flex gap-3 py-3" key={`${item.product_id}-${item.variant_id ?? 0}`}>
                                        <div className="h-16 w-14 shrink-0 overflow-hidden bg-[#eee7df]">
                                            {item.image_url && <img alt="" className="h-full w-full object-cover" src={item.image_url} />}
                                        </div>
                                        <div className="min-w-0 flex-1 text-sm">
                                            <p className="font-medium">{item.name}</p>
                                            {item.variant_value && <p className="text-flora-muted">{item.variant_name}: {item.variant_value}</p>}
                                            <p className="mt-1 text-flora-muted">Qté : {item.quantity}</p>
                                        </div>
                                        <p className="text-sm">{formatPrice(item.line_total_minor, item.currency)}</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-5 border-t border-flora-line pt-5 text-sm">
                                <p className="flex justify-between gap-4">
                                    <span>Sous-total</span>
                                    <span>{formatPrice(checkout.subtotal_minor, checkout.currency)}</span>
                                </p>
                                <p className="mt-2 text-flora-muted">Livraison : à configurer</p>
                                <p className="mt-2 text-flora-muted">Paiement : à configurer</p>
                            </div>
                            <Link className="mt-5 block text-center text-sm underline underline-offset-4" href="/cart">
                                Modifier le panier
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
