
import React, { useState } from 'react';
import axios from 'axios';

const API_KEY = "ff3ba0df65e2bacbd3197fcf54c09e22";

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const res = await axios.get(
        `https://api.opensanctions.org/entities?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `ApiKey ${API_KEY}`
          }
        }
      );
      const hits = res.data.results || [];
      if (hits.length === 0) {
        setError("Aucun résultat trouvé. Essayez d'autres orthographes.");
        return;
      }

      const categories = {
        pep: false,
        sanction: false,
        watchlist: false,
        wanted: false
      };

      hits.forEach(entity => {
        const topics = entity.topics || [];
        if (topics.includes('crime')) categories.wanted = true;
        if (topics.includes('sanction')) categories.sanction = true;
        if (topics.includes('watchlist')) categories.watchlist = true;
        if (topics.includes('pep')) categories.pep = true;
      });

      setResults(categories);
    } catch (err) {
      setError("Erreur lors de la requête API.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>CheckRisque.ma</h1>
      <p>Vérifiez si une personne ou une entité figure sur les listes PEP, sanctions, watchlists ou avis de recherche.</p>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Nom de la personne ou entité"
        style={{ padding: 10, width: 300, marginRight: 10 }}
      />
      <button onClick={handleSearch} style={{ padding: 10 }}>Vérifier</button>

      {loading && <p>Recherche en cours...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results && (
        <div style={{ marginTop: 20 }}>
          <h2>Résultats :</h2>
          <p><strong>PEP :</strong> {results.pep ? "Oui" : "Non"}</p>
          <p><strong>Sanctions :</strong> {results.sanction ? "Oui" : "Non"}</p>
          <p><strong>Watchlist :</strong> {results.watchlist ? "Oui" : "Non"}</p>
          <p><strong>Wanted :</strong> {results.wanted ? "Oui" : "Non"}</p>
        </div>
      )}
    </div>
  );
}

export default App;
