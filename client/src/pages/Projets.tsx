import { useFetch } from '../hooks/useFetch';
import type { Projet } from '../api/types';
import ProjetCard from '../components/ProjetCard';

export default function Projets() {
    const { data: projets, loading, error } = useFetch<Projet[]>('/projets');
    return (
        <section>
        <div className="page-head">
            <p className="eyebrow">Projets</p>
            <h1>Mes réalisations</h1>
            <p className="lead">Une sélection de projets menés pendant ma formation, avec les compétences mises en œuvre.</p>
        </div>
        {loading && <p>Chargement...</p>}
        {error && (
            <p className="notice notice-error" role="alert">
            Impossible de charger les projets : {error}
            </p>
        )}
        {projets && projets.length === 0 && <p>Aucun projet pour le moment.</p>}
        <div className="grid">
            {projets?.map((projet) => (
            <ProjetCard key={projet.id_projet} projet={projet} />
            ))}
        </div>
        </section>
    );
}