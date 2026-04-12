import { useState, useEffect } from 'react';
import { fetchSupermarkets } from '../services/api';

function SupermarketSelector({ selectedSupermarket, onSupermarketChange }) {
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const supermarketDomains = {
    'Albert Heijn': 'ah.nl',
    'Dirk': 'dirk.nl',
    'HEMA': 'hema.nl',
    'LIDL': 'lidl.nl',
    'Jumbo': 'jumbo.com',
    'ALDI': 'aldi.nl',
    'Plus': 'plus.nl',
    'Sligro': 'sligro.nl',
  };

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
    return <div className="text-center py-4 text-cream-400">Laden...</div>;
  }

  const getFaviconUrl = (name) => {
    const domain = supermarketDomains[name];
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  const renderLogo = (name) => {
    const faviconUrl = getFaviconUrl(name);

    if (faviconUrl) {
      return (
        <img
          src={faviconUrl}
          alt=""
          aria-hidden
          className="mr-2 w-5 h-5 rounded-sm object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'inline-flex';
          }}
        />
      );
    }

    return (
      <span aria-hidden className="mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-700 text-cream-300 text-xs font-bold">
        {(name || '').charAt(0).toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-widest text-cream-400">
        Supermarkt
      </label>
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => onSupermarketChange(null)}
          className={`filter-button ${
            selectedSupermarket === null ? 'filter-button-active' : 'filter-button-inactive'
          }`}
          aria-label="Toon alle supermarkten"
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
            aria-label={`Filter op ${supermarket.name}`}
          >
            <span className="inline-flex items-center whitespace-nowrap">
              {renderLogo(supermarket.name)}
              <span aria-hidden className="mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-700 text-cream-300 text-xs font-bold" style={{ display: 'none' }}>
                {(supermarket.name || '').charAt(0).toUpperCase()}
              </span>
              <span>{supermarket.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SupermarketSelector;
