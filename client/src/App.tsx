import { useEffect, useState } from 'react';

interface Profil {
  prenom: string;
  nom: string;
  titre: string;
}

export default function App() {
  const [profil, setProfil] = useState<Profil | null>(null);

  useEffect(() => {
    fetch('/api/profil')
      .then((res) => res.json())
      .then(setProfil)
      .catch(console.error);
  }, []);

  return <h1>{profil ? `${profil.prenom} ${profil.nom} - ${profil.titre}` : 'Chargement...'}</h1>;
}