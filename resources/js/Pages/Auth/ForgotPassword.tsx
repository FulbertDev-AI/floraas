import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { AuthLayout } from '../../Components/AuthLayout';

type FlashProps = {
    flash?: {
        status?: string;
    };
};

export default function ForgotPassword() {
    const form = useForm({ email: '' });
    const { props } = usePage<FlashProps>();

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/forgot-password');
    }

    return (
        <AuthLayout>
            <Head title="Réinitialiser le mot de passe" />
            <h1 className="font-display text-3xl">Mot de passe oublié</h1>
            <p className="mt-3 text-sm leading-6 text-flora-muted">
                Saisissez l’adresse associée à votre compte. Si la demande est acceptée, vous recevrez un lien de réinitialisation.
            </p>
            {props.flash?.status && <p className="mt-4 text-sm text-green-800">{props.flash.status}</p>}
            <form className="mt-7 grid gap-5" onSubmit={submit}>
                <label className="grid gap-2 text-sm">
                    Adresse e-mail
                    <input autoComplete="email" className="min-h-12 border border-flora-line px-3" onChange={(event) => form.setData('email', event.target.value)} required type="email" value={form.data.email} />
                    {form.errors.email && <span className="text-sm text-red-800">{form.errors.email}</span>}
                </label>
                <button className="min-h-12 bg-flora-ink px-6 text-sm text-white hover:bg-flora-accent-dark disabled:opacity-60" disabled={form.processing} type="submit">
                    Envoyer le lien
                </button>
            </form>
            <Link className="mt-6 block text-center text-sm underline underline-offset-4" href="/login">Retour à la connexion</Link>
        </AuthLayout>
    );
}
