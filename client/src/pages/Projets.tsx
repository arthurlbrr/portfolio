import { useFetch } from '../hooks/useFetch';
import type { Projet } from '../api/types';
import ProjetCard from '../components/ProjetCard';

export default function Projets() {
  const { data: projets, loading, error } = useFetch<Projet[]>('/projets');

  return (
    <section>
      <h1>Projets</h1>

      {loading && <p>Chargement...</p>}
      {error && <p role="alert">Impossible de charger les projets : {error}</p>}
      {projets && projets.length === 0 && <p>Aucun projet pour le moment.</p>}
      {projets?.map((projet) => (
        <ProjetCard key={projet.id_projet} projet={projet} />
      ))}
    </section>
  );
}