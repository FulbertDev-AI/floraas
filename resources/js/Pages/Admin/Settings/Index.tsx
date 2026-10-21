import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../Components/AdminLayout';

type Settings = {
    hero_eyebrow: string;
    hero_title: string;
    hero_description: string;
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

type Props = {
    homepage: Settings;
    announcement: {
        enabled: boolean;
        text: string;
    };
    contact: {
        location: string;
        phone: string;
        email: string;
        hours: string;
    };
};

type FormData = {
    announcement: {
        enabled: boolean;
        text: string;
    };
    contact: Props['contact'];
    homepage: Omit<Settings, 'hero_image_url'>;
    hero_image: File | null;
};

export default function Index({ homepage, announcement, contact }: Props) {
    const [heroPreviewUrl, setHeroPreviewUrl] = useState(homepage.hero_image_url);
    const form = useForm<FormData>({
        announcement,
        contact,
        homepage: {
            hero_eyebrow: homepage.hero_eyebrow,
            hero_title: homepage.hero_title,
            hero_description: homepage.hero_description,
            hero_button_text: homepage.hero_button_text,
            hero_button_url: homepage.hero_button_url,
            hero_image_alt: homepage.hero_image_alt,
            hero_image_position: homepage.hero_image_position,
            hero_visible: homepage.hero_visible,
            brand_story: homepage.brand_story,
            show_categories: homepage.show_categories,
            show_featured_products: homepage.show_featured_products,
            show_new_products: homepage.show_new_products,
            show_brand_story: homepage.show_brand_story,
        },
        hero_image: null,
    });

    useEffect(() => {
        if (!form.data.hero_image) {
            setHeroPreviewUrl(homepage.hero_image_url);
            return;
        }

        const previewUrl = URL.createObjectURL(form.data.hero_image);
        setHeroPreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [form.data.hero_image, homepage.hero_image_url]);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.put('/admin/settings', { forceFormData: true, preserveScroll: true });
    }

    return (
        <AdminLayout>
            <Head title="Paramètres de la boutique" />
            <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.18em] text-flora-muted">Configuration</p>
                <h1 className="mt-2 font-display text-4xl">Paramètres de la boutique</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-flora-muted">
                    Le texte prérempli de la page d’accueil est provisoire. Remplacez-le par les contenus et visuels officiels de FLORAA’S avant la mise en ligne.
                </p>
            </div>
            <form className="grid max-w-4xl gap-6" encType="multipart/form-data" onSubmit={submit}>
                <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                    <div>
                        <h2 className="font-display text-2xl">Barre d’annonce</h2>
                        <p className="mt-1 text-sm text-flora-muted">Aucune remise ni condition de livraison n’est créée automatiquement.</p>
                    </div>
                    <CheckField
                        checked={form.data.announcement.enabled}
                        label="Afficher la barre d’annonce"
                        onChange={(checked) => form.setData('announcement', { ...form.data.announcement, enabled: checked })}
                    />
                    <Field label="Texte" error={form.errors['announcement.text']}>
                        <input
                            className="admin-input"
                            maxLength={255}
                            onChange={(event) => form.setData('announcement', { ...form.data.announcement, text: event.target.value })}
                            value={form.data.announcement.text}
                        />
                    </Field>
                </section>
                <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                    <div>
                        <h2 className="font-display text-2xl">Bannière d’accueil</h2>
                        <p className="mt-1 text-sm text-flora-muted">Le lien est limité à une destination interne.</p>
                    </div>
                    <CheckField
                        checked={form.data.homepage.hero_visible}
                        label="Afficher la bannière sur la page d’accueil"
                        onChange={(checked) => form.setData('homepage', { ...form.data.homepage, hero_visible: checked })}
                    />
                    <Field label="Texte d’introduction" error={form.errors['homepage.hero_eyebrow']}>
                        <input className="admin-input" maxLength={100} onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_eyebrow: event.target.value })} value={form.data.homepage.hero_eyebrow} />
                    </Field>
                    <Field label="Titre" error={form.errors['homepage.hero_title']}>
                        <input className="admin-input" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_title: event.target.value })} value={form.data.homepage.hero_title} />
                    </Field>
                    <Field label="Description" error={form.errors['homepage.hero_description']}>
                        <textarea className="admin-input min-h-24 py-3" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_description: event.target.value })} value={form.data.homepage.hero_description} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Texte du bouton" error={form.errors['homepage.hero_button_text']}>
                            <input className="admin-input" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_button_text: event.target.value })} value={form.data.homepage.hero_button_text} />
                        </Field>
                        <Field label="Destination interne (ex. /shop)" error={form.errors['homepage.hero_button_url']}>
                            <input className="admin-input" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_button_url: event.target.value })} value={form.data.homepage.hero_button_url} />
                        </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Texte alternatif de l’image" error={form.errors['homepage.hero_image_alt']}>
                            <input className="admin-input" maxLength={191} onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_image_alt: event.target.value })} value={form.data.homepage.hero_image_alt} />
                        </Field>
                        <Field label="Position de l’image" error={form.errors['homepage.hero_image_position']}>
                            <select className="admin-input" onChange={(event) => form.setData('homepage', { ...form.data.homepage, hero_image_position: event.target.value })} value={form.data.homepage.hero_image_position}>
                                <option value="center">Centre</option>
                                <option value="center right">Droite</option>
                                <option value="center left">Gauche</option>
                                <option value="top">Haut</option>
                                <option value="bottom">Bas</option>
                            </select>
                        </Field>
                    </div>
                    {heroPreviewUrl ? (
                        <div>
                            <p className="mb-2 text-xs uppercase tracking-wide text-flora-muted">Aperçu de l’image</p>
                            <img
                                alt={form.data.homepage.hero_image_alt || 'Aperçu de la bannière'}
                                className="aspect-[16/7] max-h-72 w-full bg-flora-paper object-cover"
                                src={heroPreviewUrl}
                                style={{ objectPosition: form.data.homepage.hero_image_position }}
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-[16/7] max-h-72 items-center justify-center bg-[#eee4dc] px-5 text-center font-display text-xl text-flora-muted">
                            Aperçu de la bannière FLORAA’S
                        </div>
                    )}
                    <Field label="Image de bannière (JPG, PNG ou WebP, 5 Mo maximum)" error={form.errors.hero_image}>
                        <input accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-4 file:min-h-11 file:border-0 file:bg-flora-paper file:px-4" onChange={(event) => form.setData('hero_image', event.target.files?.[0] ?? null)} type="file" />
                    </Field>
                </section>
                <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                    <div>
                        <h2 className="font-display text-2xl">Coordonnées de la boutique</h2>
                        <p className="mt-1 text-sm text-flora-muted">Le téléphone et les horaires restent masqués sur le site tant qu’ils ne sont pas renseignés.</p>
                    </div>
                    <Field label="Localisation" error={form.errors['contact.location']}>
                        <input className="admin-input" maxLength={191} onChange={(event) => form.setData('contact', { ...form.data.contact, location: event.target.value })} value={form.data.contact.location} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Téléphone" error={form.errors['contact.phone']}>
                            <input autoComplete="tel" className="admin-input" maxLength={40} onChange={(event) => form.setData('contact', { ...form.data.contact, phone: event.target.value })} type="tel" value={form.data.contact.phone} />
                        </Field>
                        <Field label="E-mail professionnel" error={form.errors['contact.email']}>
                            <input autoComplete="email" className="admin-input" maxLength={254} onChange={(event) => form.setData('contact', { ...form.data.contact, email: event.target.value })} type="email" value={form.data.contact.email} />
                        </Field>
                    </div>
                    <Field label="Horaires d’ouverture" error={form.errors['contact.hours']}>
                        <textarea className="admin-input min-h-24 py-3" maxLength={1000} onChange={(event) => form.setData('contact', { ...form.data.contact, hours: event.target.value })} value={form.data.contact.hours} />
                    </Field>
                </section>
                <section className="grid gap-5 border border-flora-line bg-white p-5 sm:p-7">
                    <h2 className="font-display text-2xl">Sections de la page</h2>
                    <CheckField checked={form.data.homepage.show_categories} label="Catégories publiées" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_categories: checked })} />
                    <CheckField checked={form.data.homepage.show_featured_products} label="Produits mis à la une" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_featured_products: checked })} />
                    <CheckField checked={form.data.homepage.show_new_products} label="Nouveautés" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_new_products: checked })} />
                    <CheckField checked={form.data.homepage.show_brand_story} label="Présentation de la marque" onChange={(checked) => form.setData('homepage', { ...form.data.homepage, show_brand_story: checked })} />
                    <Field label="Présentation de FLORAA’S (rédigée/validée par la marque)" error={form.errors['homepage.brand_story']}>
                        <textarea className="admin-input min-h-40 py-3" onChange={(event) => form.setData('homepage', { ...form.data.homepage, brand_story: event.target.value })} value={form.data.homepage.brand_story} />
                    </Field>
                </section>
                {Object.keys(form.errors).length > 0 && (
                    <p className="text-sm text-red-800" role="alert">Certaines valeurs sont à corriger avant l’enregistrement.</p>
                )}
                <button className="min-h-12 w-full bg-flora-ink px-6 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60 sm:w-fit" disabled={form.processing} type="submit">
                    {form.processing ? 'Enregistrement…' : 'Enregistrer les paramètres'}
                </button>
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
