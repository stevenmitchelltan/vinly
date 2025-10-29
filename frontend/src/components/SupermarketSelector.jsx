import { useState, useEffect } from 'react';
import { fetchSupermarkets } from '../services/api';
import { lightHaptic } from '../utils/haptics';

function SupermarketSelector({ selectedSupermarket, onSupermarketChange }) {
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map supermarket names to their website domains for favicon fetching
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
    return <div className="text-center py-4">Laden...</div>;
  }

  const getFaviconUrl = (name) => {
    const domain = supermarketDomains[name];
    if (!domain) return null;
    // Use Google's favicon service for reliable, high-quality icons
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  };

  const renderLogo = (name, showFavicon = true) => {
    const letter = (name || '').charAt(0).toUpperCase();
    const faviconUrl = showFavicon ? getFaviconUrl(name) : null;
    
    if (faviconUrl) {
      return (
        <img 
          src={faviconUrl} 
          alt="" 
          aria-hidden
          className="mr-2 w-5 h-5 rounded-sm object-contain"
          onError={(e) => {
            // Fallback to letter icon if favicon fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'inline-flex';
          }}
        />
      );
    }
    
    return (
      <span aria-hidden className="mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-burgundy-100 text-burgundy-800 text-xs font-bold">
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
          onClick={() => {
            lightHaptic();
            onSupermarketChange(null);
          }}
          className={`filter-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400 ${
            selectedSupermarket === null ? 'filter-button-active' : 'filter-button-inactive'
          }`}
          aria-label="Toon alle supermarkten"
        >
          Alle
        </button>
        {supermarkets.map((supermarket) => (
          <button
            key={supermarket.value}
            onClick={() => {
              lightHaptic();
              onSupermarketChange(supermarket.value);
            }}
            className={`filter-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy-400 ${
              selectedSupermarket === supermarket.value
                ? 'filter-button-active'
                : 'filter-button-inactive'
            }`}
            aria-label={`Filter op ${supermarket.name}`}
          >
            <span className="inline-flex items-center">
              {renderLogo(supermarket.name)}
              <span aria-hidden className="mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-burgundy-100 text-burgundy-800 text-xs font-bold" style={{ display: 'none' }}>
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

