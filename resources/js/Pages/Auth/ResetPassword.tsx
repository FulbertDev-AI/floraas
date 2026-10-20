import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthLayout } from '../../Components/AuthLayout';

export default function ResetPassword({ email, token }: { email: string; token: string }) {
    const form = useForm({
        email,
        token,
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/reset-password');
    }

    return (
        <AuthLayout>
            <Head title="Choisir un nouveau mot de passe" />
            <h1 className="font-display text-3xl">Nouveau mot de passe</h1>
            <form className="mt-7 grid gap-5" onSubmit={submit}>
                <label className="grid gap-2 text-sm">
                    Adresse e-mail
                    <input autoComplete="email" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('email', event.target.value)} required type="email" value={form.data.email} />
                    {form.errors.email && <span className="text-sm text-red-800">{form.errors.email}</span>}
                </label>
                <label className="grid gap-2 text-sm">
                    Nouveau mot de passe
                    <input autoComplete="new-password" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('password', event.target.value)} required type="password" value={form.data.password} />
                    {form.errors.password && <span className="text-sm text-red-800">{form.errors.password}</span>}
                </label>
                <label className="grid gap-2 text-sm">
                    Confirmer le mot de passe
                    <input autoComplete="new-password" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('password_confirmation', event.target.value)} required type="password" value={form.data.password_confirmation} />
                </label>
                <button className="min-h-12 bg-flora-ink px-6 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60" disabled={form.processing} type="submit">
                    Mettre à jour le mot de passe
                </button>
            </form>
            <Link className="mt-6 block text-center text-sm underline underline-offset-4" href="/login">Retour à la connexion</Link>
        </AuthLayout>
    );
}
