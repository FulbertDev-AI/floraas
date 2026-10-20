import { Head, Link } from '@inertiajs/react';
import { StoreLayout } from '../../Components/StoreLayout';

type OrderItem = {
    product_name: string;
    variant_value: string | null;
    quantity: number;
    unit_price_minor: number;
    currency: string;
};

type OrderRequest = {
    reference: string;
    contact_name: string;
    status: string;
    currency: string;
    subtotal_minor: number;
    items: OrderItem[];
};

function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100);
}

export default function OrderRequestConfirmation({ order }: { order: OrderRequest }) {
    return (
        <StoreLayout>
            <Head title="Demande enregistrée" />
            <section className="mx-auto max-w-3xl px-5 py-12 sm:py-20">
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Confirmation</p>
                <h1 className="mt-2 font-display text-4xl sm:text-5xl">Demande reçue</h1>
                <div className="mt-8 border border-flora-line bg-white p-6 sm:p-8">
                    <p className="text-sm text-flora-muted">Référence</p>
                    <p className="mt-2 break-all font-display text-3xl">{order.reference}</p>
                    <p className="mt-5 text-sm leading-7 text-flora-muted">
                        Bonjour {order.contact_name}, votre demande a bien été enregistrée. Elle reste en statut non confirmée et ne constitue ni une commande payée ni une validation commerciale.
                    </p>
                    <div className="mt-6 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        Statut actuel : <span className="font-medium">{order.status}</span>
                    </div>

                    <div className="mt-8 border-t border-flora-line pt-6">
                        <h2 className="font-display text-2xl">Récapitulatif</h2>
                        <ul className="mt-4 space-y-3 text-sm">
                            {order.items.map((item, index) => (
                                <li className="flex items-start justify-between gap-4 border-b border-flora-line pb-3" key={`${item.product_name}-${index}`}>
                                    <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        {item.variant_value && <p className="text-flora-muted">{item.variant_value}</p>}
                                        <p className="text-flora-muted">Qté : {item.quantity}</p>
                                    </div>
                                    <p>{formatPrice(item.unit_price_minor * item.quantity, item.currency)}</p>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-5 flex justify-between text-sm font-medium">
                            <span>Sous-total</span>
                            <span>{formatPrice(order.subtotal_minor, order.currency)}</span>
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link className="inline-flex min-h-11 items-center bg-flora-ink px-5 text-sm text-white" href="/shop">
                            Retourner à la boutique
                        </Link>
                        <Link className="inline-flex min-h-11 items-center border border-flora-line px-5 text-sm" href="/">
                            Accueil
                        </Link>
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
