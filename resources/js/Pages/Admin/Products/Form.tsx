import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AdminLayout } from '../../../Components/AdminLayout';

type Option = {
    id: number;
    name: string;
};

type ExistingImage = {
    id: number;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
};

type ProductInput = {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    short_description: string | null;
    description: string | null;
    price: string;
    compare_at_price: string;
    currency: string | null;
    stock_quantity: number;
    is_featured: boolean;
    is_new: boolean;
    is_published: boolean;
    category_ids: number[];
    collection_ids: number[];
    image_urls: ExistingImage[];
    variants: VariantInput[];
};

type VariantInput = {
    id?: number;
    option_name: string;
    option_value: string;
    sku: string;
    price: string;
    stock_quantity: number;
    is_available: boolean;
};

type FormData = {
    name: string;
    slug: string;
    sku: string;
    short_description: string;
    description: string;
    price: string;
    compare_at_price: string;
    currency: string;
    stock_quantity: number;
    is_featured: boolean;
    is_new: boolean;
    is_published: boolean;
    category_ids: number[];
    collection_ids: number[];
    variants: VariantInput[];
    images: File[];
    primary_image_index: number | null;
    primary_image_id: number | null;
};

type Props = {
    product: ProductInput | null;
    categories: Option[];
    collections: Option[];
};

function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function Form({ product, categories, collections }: Props) {
    const form = useForm<FormData>({
        name: product?.name ?? '',
        slug: product?.slug ?? '',
        sku: product?.sku ?? '',
        short_description: product?.short_description ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        compare_at_price: product?.compare_at_price ?? '',
        currency: product?.currency ?? '',
        stock_quantity: product?.stock_quantity ?? 0,
        is_featured: product?.is_featured ?? false,
        is_new: product?.is_new ?? false,
        is_published: product?.is_published ?? false,
        category_ids: product?.category_ids ?? [],
        collection_ids: product?.collection_ids ?? [],
        variants: product?.variants ?? [],
        images: [],
        primary_image_index: null,
        primary_image_id: product?.image_urls.find((image) => image.is_primary)?.id ?? null,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (product) {
            form.put(`/admin/products/${product.id}`, { forceFormData: true, preserveScroll: true });
        } else {
            form.post('/admin/products', { forceFormData: true, preserveScroll: true });
        }
    }

    function toggleSelection(key: 'category_ids' | 'collection_ids', id: number, checked: boolean) {
        const selected = form.data[key];
        form.setData(key, checked ? [...selected, id] : selected.filter((value) => value !== id));
    }

    return (
        <AdminLayout>
            <Head title={product ? 'Modifier le produit' : 'Nouveau produit'} />
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Catalogue</p>
                    <h1 className="mt-2 font-display text-4xl">{product ? 'Modifier le produit' : 'Nouveau produit'}</h1>
                </div>
                <Link className="text-sm underline underline-offset-4" href="/admin/products">Retour aux produits</Link>
            </div>
            <form className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" encType="multipart/form-data" onSubmit={submit}>
                <div className="grid content-start gap-6">
                    <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                        <h2 className="font-display text-2xl">Informations produit</h2>
                        <Field label="Nom du produit" error={form.errors.name}>
                            <input autoComplete="off" className="admin-input" onChange={(event) => form.setData('name', event.target.value)} required value={form.data.name} />
                        </Field>
                        <Field label="Slug" error={form.errors.slug}>
                            <input className="admin-input" onBlur={() => !form.data.slug && form.setData('slug', slugify(form.data.name))} onChange={(event) => form.setData('slug', slugify(event.target.value))} value={form.data.slug} />
                        </Field>
                        <Field label="Référence SKU" error={form.errors.sku}>
                            <input className="admin-input" onChange={(event) => form.setData('sku', event.target.value)} value={form.data.sku} />
                        </Field>
                        <Field label="Description courte" error={form.errors.short_description}>
                            <textarea className="admin-input min-h-24" maxLength={500} onChange={(event) => form.setData('short_description', event.target.value)} value={form.data.short_description} />
                        </Field>
                        <Field label="Description détaillée" error={form.errors.description}>
                            <textarea className="admin-input min-h-40" onChange={(event) => form.setData('description', event.target.value)} value={form.data.description} />
                        </Field>
                    </section>
                    <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                        <h2 className="font-display text-2xl">Photos</h2>
                        {product?.image_urls && product.image_urls.length > 0 && (
                            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                                {product.image_urls.map((image) => (
                                    <label className="relative aspect-square cursor-pointer overflow-hidden bg-[#eee7df]" key={image.id}>
                                        <img alt={image.alt_text ?? ''} className="h-full w-full object-cover" src={image.url} />
                                        {image.is_primary && <span className="absolute inset-x-0 bottom-0 bg-white/90 px-1 py-1 text-center text-[10px]">Principale</span>}
                                        <span className="absolute left-1 top-1 rounded bg-white/90 p-1">
                                            <input
                                                aria-label={`Définir ${image.alt_text ?? 'cette image'} comme image principale`}
                                                checked={form.data.primary_image_id === image.id}
                                                name="primary_image"
                                                onChange={() => {
                                                    form.setData('primary_image_id', image.id);
                                                    form.setData('primary_image_index', null);
                                                }}
                                                type="radio"
                                            />
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <Field label="Ajouter des images (JPG, PNG ou WebP, 5 Mo maximum chacune)" error={form.errors.images}>
                            <input accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-4 file:min-h-11 file:border-0 file:bg-flora-paper file:px-4" multiple onChange={(event) => form.setData('images', Array.from(event.target.files ?? []))} type="file" />
                        </Field>
                        {form.data.images.length > 0 && (
                            <Field label="Image principale parmi les nouveaux fichiers">
                                <select
                                    className="admin-input"
                                    onChange={(event) => {
                                        form.setData('primary_image_index', event.target.value === '' ? null : Number(event.target.value));
                                        if (event.target.value !== '') {
                                            form.setData('primary_image_id', null);
                                        }
                                    }}
                                    value={form.data.primary_image_index ?? ''}
                                >
                                    <option value="">Conserver l’image principale sélectionnée</option>
                                    {form.data.images.map((image, index) => <option key={`${image.name}-${index}`} value={index}>{image.name}</option>)}
                                </select>
                            </Field>
                        )}
                        {form.errors['images.0'] && <p className="text-sm text-red-800">{form.errors['images.0']}</p>}
                    </section>
                    <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                        <h2 className="font-display text-2xl">Catégories et collections</h2>
                        <OptionGroup
                            options={categories}
                            selected={form.data.category_ids}
                            onChange={(id, checked) => toggleSelection('category_ids', id, checked)}
                            title="Catégories"
                        />
                        {form.errors.category_ids && <p className="text-sm text-red-800">{form.errors.category_ids}</p>}
                        <OptionGroup
                            options={collections}
                            selected={form.data.collection_ids}
                            onChange={(id, checked) => toggleSelection('collection_ids', id, checked)}
                            title="Collections"
                        />
                    </section>
                    <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="font-display text-2xl">Variantes et nuances</h2>
                                <p className="mt-1 text-sm text-flora-muted">Chaque option peut avoir son propre SKU, prix et stock.</p>
                            </div>
                            <button
                                className="min-h-10 border border-flora-line px-4 text-sm hover:border-flora-ink"
                                onClick={() => form.setData('variants', [
                                    ...form.data.variants,
                                    { option_name: 'Nuance', option_value: '', sku: '', price: '', stock_quantity: 0, is_available: true },
                                ])}
                                type="button"
                            >
                                Ajouter une variante
                            </button>
                        </div>
                        {form.data.variants.map((variant, index) => (
                            <div className="grid gap-3 border-t border-flora-line pt-4 sm:grid-cols-2" key={variant.id ?? `new-${index}`}>
                                <Field label="Nom de l’option" error={form.errors[`variants.${index}.option_name`]}>
                                    <input className="admin-input" onChange={(event) => updateVariant(form.data.variants, index, { option_name: event.target.value }, form.setData)} required value={variant.option_name} />
                                </Field>
                                <Field label="Valeur / nuance" error={form.errors[`variants.${index}.option_value`]}>
                                    <input className="admin-input" onChange={(event) => updateVariant(form.data.variants, index, { option_value: event.target.value }, form.setData)} required value={variant.option_value} />
                                </Field>
                                <Field label="SKU propre à l’option" error={form.errors[`variants.${index}.sku`]}>
                                    <input className="admin-input" onChange={(event) => updateVariant(form.data.variants, index, { sku: event.target.value }, form.setData)} value={variant.sku} />
                                </Field>
                                <Field label="Prix de l’option (facultatif)" error={form.errors[`variants.${index}.price`]}>
                                    <input className="admin-input" min="0" onChange={(event) => updateVariant(form.data.variants, index, { price: event.target.value }, form.setData)} step="0.01" type="number" value={variant.price} />
                                </Field>
                                <Field label="Stock de l’option" error={form.errors[`variants.${index}.stock_quantity`]}>
                                    <input className="admin-input" min="0" onChange={(event) => updateVariant(form.data.variants, index, { stock_quantity: Number(event.target.value) }, form.setData)} required type="number" value={variant.stock_quantity} />
                                </Field>
                                <div className="flex items-end justify-between gap-4">
                                    <CheckField checked={variant.is_available} label="Option disponible" onChange={(checked) => updateVariant(form.data.variants, index, { is_available: checked }, form.setData)} />
                                    <button
                                        className="min-h-10 px-3 text-sm text-red-900 underline underline-offset-4"
                                        onClick={() => form.setData('variants', form.data.variants.filter((_, rowIndex) => rowIndex !== index))}
                                        type="button"
                                    >
                                        Retirer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                <aside className="grid content-start gap-6">
                    <section className="grid gap-5 border border-flora-line bg-white p-5">
                        <h2 className="font-display text-2xl">Prix et stock</h2>
                        <Field label="Prix de vente" error={form.errors.price}>
                            <input className="admin-input" min="0" onChange={(event) => form.setData('price', event.target.value)} step="0.01" type="number" value={form.data.price} />
                        </Field>
                        <Field label="Prix initial (facultatif)" error={form.errors.compare_at_price}>
                            <input className="admin-input" min="0" onChange={(event) => form.setData('compare_at_price', event.target.value)} step="0.01" type="number" value={form.data.compare_at_price} />
                        </Field>
                        <Field label="Devise (code ISO 4217)" error={form.errors.currency}>
                            <input className="admin-input uppercase" maxLength={3} onChange={(event) => form.setData('currency', event.target.value.toUpperCase())} placeholder="À définir" value={form.data.currency} />
                        </Field>
                        <Field label="Quantité en stock" error={form.errors.stock_quantity}>
                            <input className="admin-input" min="0" onChange={(event) => form.setData('stock_quantity', Number(event.target.value))} required type="number" value={form.data.stock_quantity} />
                        </Field>
                        <p className="text-xs leading-5 text-flora-muted">
                            Aucun prix, devise ou stock n’est inventé. Les champs commerciaux sont à compléter avant publication.
                        </p>
                    </section>
                    <section className="grid gap-4 border border-flora-line bg-white p-5">
                        <h2 className="font-display text-2xl">Visibilité</h2>
                        <CheckField checked={form.data.is_published} label="Publier dans la boutique" onChange={(checked) => form.setData('is_published', checked)} />
                        {form.errors.is_published && <p className="text-sm text-red-800">{form.errors.is_published}</p>}
                        <CheckField checked={form.data.is_featured} label="Mettre à la une" onChange={(checked) => form.setData('is_featured', checked)} />
                        <CheckField checked={form.data.is_new} label="Marquer comme nouveauté" onChange={(checked) => form.setData('is_new', checked)} />
                        <button className="min-h-12 bg-flora-ink px-5 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60" disabled={form.processing} type="submit">
                            {form.processing ? 'Enregistrement…' : product ? 'Enregistrer les modifications' : 'Enregistrer le produit'}
                        </button>
                        {Object.keys(form.errors).length > 0 && (
                            <p className="text-sm text-red-800" role="alert">Vérifiez les champs signalés avant d’enregistrer.</p>
                        )}
                    </section>
                    {product && (
                        <section className="border border-red-900/20 bg-white p-5">
                            <h2 className="font-display text-xl">Archiver ce produit</h2>
                            <Link
                                as="button"
                                className="mt-4 min-h-11 w-full border border-red-900/30 px-4 text-sm text-red-900 hover:bg-red-50"
                                href={`/admin/products/${product.id}`}
                                method="delete"
                                onBefore={() => window.confirm('Archiver ce produit ? Il ne sera plus affiché dans la boutique.')}
                            >
                                Archiver le produit
                            </Link>
                        </section>
                    )}
                </aside>
            </form>
        </AdminLayout>
    );
}

function Field({
    children,
    error,
    label,
}: {
    children: React.ReactNode;
    error?: string;
    label: string;
}) {
    return (
        <label className="grid gap-2 text-sm">
            {label}
            {children}
            {error && <span className="text-sm text-red-800">{error}</span>}
        </label>
    );
}

function CheckField({
    checked,
    label,
    onChange,
}: {
    checked: boolean;
    label: string;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-3 text-sm">
            <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
            {label}
        </label>
    );
}

function OptionGroup({
    onChange,
    options,
    selected,
    title,
}: {
    onChange: (id: number, checked: boolean) => void;
    options: Option[];
    selected: number[];
    title: string;
}) {
    return (
        <fieldset className="grid gap-3">
            <legend className="text-sm font-medium">{title}</legend>
            {options.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                    {options.map((option) => (
                        <label className="flex items-center gap-3 text-sm" key={option.id}>
                            <input
                                checked={selected.includes(option.id)}
                                onChange={(event) => onChange(option.id, event.target.checked)}
                                type="checkbox"
                            />
                            {option.name}
                        </label>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-flora-muted">Aucun élément disponible pour le moment.</p>
            )}
        </fieldset>
    );
}

function updateVariant(
    variants: VariantInput[],
    index: number,
    changes: Partial<VariantInput>,
    setData: (key: 'variants', value: VariantInput[]) => void,
) {
    setData('variants', variants.map((variant, rowIndex) => (
        rowIndex === index ? { ...variant, ...changes } : variant
    )));
}
