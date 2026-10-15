import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { apiFetch, ApiError } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import type { Profil } from '../api/types';

type Status = 'idle' | 'sending' | 'success' | 'error';

const INITIAL_FORM = { nom: '', email: '', contenu: '', website: '' };

export default function Contact() {
    const { data: profil } = useFetch<Profil>('/profil');
    const [form, setForm] = useState(INITIAL_FORM);
    const [status, setStatus] = useState<Status>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('sending');
        try {
        await apiFetch('/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        setForm(INITIAL_FORM);
        setStatus('success');
        } catch (err) {
        if (err instanceof ApiError && err.status === 400) {
            setErrorMessage('Vérifiez les champs : email valide, message de 2000 caractères maximum.');
        } else if (err instanceof ApiError) {
            setErrorMessage(err.message);
        } else {
            setErrorMessage('Une erreur est survenue, réessayez plus tard.');
        }
        setStatus('error');
        }
    }
    return (
        <section>
        <div className="page-head">
            <p className="eyebrow">Contact</p>
            <h1>Écrivez-moi</h1>
            <p className="lead">Un stage, une alternance, une question ? Remplissez le formulaire ou utilisez les liens ci-contre.</p>
        </div>
        <div className="contact-layout">
            <ul className="contact-infos" aria-label="Coordonnées">
            {profil && (
                <>
                <li>
                    <span className="label">Email</span>
                    <a className="link-arrow" href={`mailto:${profil.email}`}>
                    {profil.email}
                    </a>
                </li>
                {profil.linkedin && (
                    <li>
                    <span className="label">LinkedIn</span>
                    <a className="link-arrow" href={profil.linkedin} target="_blank" rel="noopener noreferrer">
                        Mon profil
                    </a>
                    </li>
                )}
                {profil.github && (
                    <li>
                    <span className="label">GitHub</span>
                    <a className="link-arrow" href={profil.github} target="_blank" rel="noopener noreferrer">
                        Mes dépôts
                    </a>
                    </li>
                )}
                {profil.ville && (
                    <li>
                    <span className="label">Localisation</span>
                    {profil.ville}
                    </li>
                )}
                </>
            )}
            </ul>
            <form className="form" onSubmit={handleSubmit}>
            <div className="field">
                <label htmlFor="nom">Nom</label>
                <input id="nom" name="nom" type="text" value={form.nom} onChange={handleChange} maxLength={100} required />
            </div>
            <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} maxLength={255} required />
            </div>
            <div className="field">
                <label htmlFor="contenu">Message</label>
                <textarea
                id="contenu"
                name="contenu"
                rows={6}
                value={form.contenu}
                onChange={handleChange}
                maxLength={2000}
                required
                />
                <span className="hint">{form.contenu.length} / 2000</span>
            </div>
            {/* Champ piège : rempli uniquement par les robots */}
            <div className="champ-piege" aria-hidden="true">
                <label htmlFor="website">Ne pas remplir</label>
                <input
                id="website"
                name="website"
                type="text"
                value={form.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                />
            </div>
            <button className="btn" type="submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Envoi en cours...' : 'Envoyer'}
            </button>
            {status === 'success' && (
                <p className="notice notice-success" role="status">
                Merci, votre message a bien été envoyé.
                </p>
            )}
            {status === 'error' && (
                <p className="notice notice-error" role="alert">
                {errorMessage}
                </p>
            )}
            </form>
        </div>
        </section>
    );
}