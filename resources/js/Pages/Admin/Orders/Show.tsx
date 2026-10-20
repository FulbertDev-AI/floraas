import { Head, Link, useForm } from '@inertiajs/react';
import { AdminLayout } from '../../../Components/AdminLayout';

type Order = {
    id: number;
    reference: string;
    contact_name: string;
    email: string;
    phone: string | null;
    status: string;
    status_label: string;
    payment_status: string;
    payment_status_label: string;
    currency: string;
    subtotal_minor: number;
    created_at: string;
    items: Array<{
        id: number;
        product_name: string;
        sku: string | null;
        variant_name: string | null;
        variant_value: string | null;
        quantity: number;
        unit_price_minor: number;
        currency: string;
    }>;
    allowed_transitions: string[];
};

const statusLabels: Record<string, string> = {
    contacted: 'Client contacté',
    cancelled: 'Annuler la demande',
};

function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount / 100);
}

export default function Show({ order }: { order: Order }) {
    const form = useForm({ status: '' });

    function updateStatus(status: string) {
        form.setData('status', status);
        form.patch(`/admin/orders/${order.id}`);
    }

    return (
        <AdminLayout>
            <Head title={`Demande ${order.reference}`} />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <Link className="text-sm underline underline-offset-4" href="/admin/orders">Retour aux demandes</Link>
                    <h1 className="mt-3 break-all font-display text-4xl">{order.reference}</h1>
                    <p className="mt-2 text-sm text-flora-muted">Reçue le {order.created_at}</p>
                </div>
                <div className="border border-flora-line bg-white px-4 py-3 text-sm">
                    <p>Statut : <span className="font-medium">{order.status_label}</span></p>
                    <p className="mt-1">Paiement : <span className="font-medium">{order.payment_status_label}</span></p>
                </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                <section className="h-fit border border-flora-line bg-white p-5">
                    <h2 className="font-display text-2xl">Coordonnées</h2>
                    <p className="mt-4 font-medium">{order.contact_name}</p>
                    <p className="mt-1 text-sm">{order.email}</p>
                    {order.phone && <p className="mt-1 text-sm">{order.phone}</p>}
                    <p className="mt-4 border-l-2 border-amber-500 pl-3 text-sm leading-6 text-amber-900">
                        Demande non confirmée. Le paiement et la livraison ne sont pas configurés.
                    </p>
                    {order.allowed_transitions.length > 0 && (
                        <div className="mt-6 border-t border-flora-line pt-5">
                            <p className="text-sm font-medium">Mettre à jour le suivi</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {order.allowed_transitions.map((status) => (
                                    <button
                                        className="min-h-10 border border-flora-line px-3 text-sm hover:bg-flora-paper disabled:opacity-50"
                                        disabled={form.processing}
                                        key={status}
                                        onClick={() => updateStatus(status)}
                                        type="button"
                                    >
                                        {statusLabels[status] ?? status}
                                    </button>
                                ))}
                            </div>
                            {form.errors.status && <p className="mt-3 text-sm text-red-800">{form.errors.status}</p>}
                        </div>
                    )}
                </section>

                <section className="border border-flora-line bg-white p-5">
                    <h2 className="font-display text-2xl">Articles demandés</h2>
                    <ul className="mt-4 divide-y divide-flora-line">
                        {order.items.map((item) => (
                            <li className="flex justify-between gap-4 py-4 text-sm" key={item.id}>
                                <div>
                                    <p className="font-medium">{item.product_name}</p>
                                    {item.sku && <p className="text-flora-muted">SKU : {item.sku}</p>}
                                    {item.variant_value && (
                                        <p className="text-flora-muted">{item.variant_name}: {item.variant_value}</p>
                                    )}
                                    <p className="text-flora-muted">Quantité : {item.quantity}</p>
                                </div>
                                <p className="text-right">
                                    {formatPrice(item.unit_price_minor * item.quantity, item.currency)}
                                    <span className="block text-xs text-flora-muted">
                                        {formatPrice(item.unit_price_minor, item.currency)} / unité
                                    </span>
                                </p>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-5 flex justify-between border-t border-flora-line pt-5 text-sm font-medium">
                        <span>Sous-total indicatif</span>
                        <span>{formatPrice(order.subtotal_minor, order.currency)}</span>
                    </p>
                </section>
            </div>
        </AdminLayout>
    );
}
