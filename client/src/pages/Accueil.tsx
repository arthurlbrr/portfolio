import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';
import type { Profil } from '../api/types';

export default function Accueil() {
    const [profil, setProfil] = useState<Profil | null>(null);
    useEffect(() => {
        apiFetch<Profil>('/profil').then(setProfil).catch(console.error);
    }, []);
    return (
        <section>
        <h1>{profil ? `${profil.prenom} ${profil.nom}` : 'Chargement...'}</h1>
        {profil && <p>{profil.titre}</p>}
        </section>
    );
}