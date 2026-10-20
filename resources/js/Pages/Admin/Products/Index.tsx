import { Head, Link } from '@inertiajs/react';
import { AdminLayout } from '../../../Components/AdminLayout';
import type { ProductSummary } from '../../../types';

type ProductRow = ProductSummary & {
    sku: string | null;
    is_published: boolean;
    categories: string[];
};

type Props = {
    products: {
        data: ProductRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        total: number;
    };
};

export default function Index({ products }: Props) {
    return (
        <AdminLayout>
            <Head title="Produits" />
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Catalogue</p>
                    <h1 className="mt-2 font-display text-4xl">Produits</h1>
                    <p className="mt-2 text-sm text-flora-muted">{products.total} produit(s)</p>
                </div>
                <Link className="inline-flex min-h-11 items-center bg-flora-ink px-5 text-sm text-white hover:bg-flora-accent-dark" href="/admin/products/create">
                    Ajouter un produit
                </Link>
            </div>
            <div className="mt-8 overflow-hidden border border-flora-line bg-white">
                {products.data.length > 0 ? (
                    <ul className="divide-y divide-flora-line">
                        {products.data.map((product) => (
                            <li className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center" key={product.id}>
                                <div className="h-20 w-16 shrink-0 overflow-hidden bg-[#eee7df]">
                                    {product.primary_image && (
                                        <img alt="" className="h-full w-full object-cover" loading="lazy" src={product.primary_image.url} />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <Link className="font-medium hover:underline" href={`/admin/products/${product.id}/edit`}>{product.name}</Link>
                                    <p className="mt-1 truncate text-sm text-flora-muted">
                                        {product.sku ?? 'Sans référence'}{product.categories.length > 0 ? ` · ${product.categories.join(', ')}` : ''}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-wide text-flora-muted">
                                        {product.is_published ? 'Publié' : 'Brouillon'} · Stock : {product.stock_quantity}
                                    </p>
                                </div>
                                <Link className="text-sm underline underline-offset-4" href={`/admin/products/${product.id}/edit`}>
                                    Modifier
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-6 py-14 text-center">
                        <h2 className="font-display text-2xl">Votre catalogue est prêt à commencer</h2>
                        <p className="mt-2 text-sm text-flora-muted">Ajoutez les premières références de FLORAA’S pour les publier dans la boutique.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
