import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { apiFetch, ApiError } from '../api/client';

type Status = 'idle' | 'sending' | 'success' | 'error';

const INITIAL_FORM = { nom: '', email: '', contenu: '', website: '' };

export default function Contact() {
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
        <h1>Contact</h1>
        <form onSubmit={handleSubmit}>
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" type="text" value={form.nom} onChange={handleChange} maxLength={100} required />
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} maxLength={255} required />
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
            <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi en cours...' : 'Envoyer'}
            </button>
        </form>
        {status === 'success' && <p role="status">Merci, votre message a bien été envoyé.</p>}
        {status === 'error' && <p role="alert">{errorMessage}</p>}
        </section>
    );
}