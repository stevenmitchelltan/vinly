import { useState, useEffect } from 'react';
import { fetchSupermarkets } from '../services/api';

function SupermarketSelector({ selectedSupermarket, onSupermarketChange }) {
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupermarkets();
  }, []);

  const loadSupermarkets = async () => {
    try {
      const data = await fetchSupermarkets();
      setSupermarkets(data);
    } catch (error) {
      console.error('Failed to load supermarkets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Laden...</div>;
  }

  const renderLogo = (name) => {
    const letter = (name || '').charAt(0).toUpperCase();
    return (
      <span aria-hidden className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-burgundy-100 text-burgundy-800 text-xs font-bold">
        {letter}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        🏪 <span>Kies je supermarkt</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onSupermarketChange(null)}
          className={`filter-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400 ${
            selectedSupermarket === null ? 'filter-button-active' : 'filter-button-inactive'
          }`}
          aria-label="Toon alle supermarkten"
        >
          <span className="inline-flex items-center">{renderLogo('A')}<span>Alle</span></span>
        </button>
        {supermarkets.map((supermarket) => (
          <button
            key={supermarket.value}
            onClick={() => onSupermarketChange(supermarket.value)}
            className={`filter-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400 ${
              selectedSupermarket === supermarket.value
                ? 'filter-button-active'
                : 'filter-button-inactive'
            }`}
            aria-label={`Filter op ${supermarket.name}`}
          >
            <span className="inline-flex items-center">{renderLogo(supermarket.name)}<span>{supermarket.name}</span></span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SupermarketSelector;

