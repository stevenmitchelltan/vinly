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

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Kies je supermarkt</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => onSupermarketChange(null)}
          className={`filter-button ${
            selectedSupermarket === null ? 'filter-button-active' : 'filter-button-inactive'
          }`}
        >
          Alle
        </button>
        {supermarkets.map((supermarket) => (
          <button
            key={supermarket.value}
            onClick={() => onSupermarketChange(supermarket.value)}
            className={`filter-button ${
              selectedSupermarket === supermarket.value
                ? 'filter-button-active'
                : 'filter-button-inactive'
            }`}
          >
            {supermarket.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SupermarketSelector;

