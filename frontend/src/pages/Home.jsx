import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SupermarketSelector from '../components/SupermarketSelector';
import WineTypeFilter from '../components/WineTypeFilter';
import WineGrid from '../components/WineGrid';
import { fetchWines } from '../services/api';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupermarket, setSelectedSupermarket] = useState(searchParams.get('supermarket'));
  const [selectedType, setSelectedType] = useState(searchParams.get('type'));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  useEffect(() => {
    loadWines();
  }, [selectedSupermarket, selectedType]);

  // Debounce search to reduce re-render storms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadWines = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWines(selectedSupermarket, selectedType);
      setWines(data);
    } catch (error) {
      console.error('Failed to load wines:', error);
      setWines([]);
      setError('Laden van wijnen is mislukt. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  // Sync UI state with URL query params (shareable filters)
  useEffect(() => {
    const next = {};
    if (selectedSupermarket) next.supermarket = selectedSupermarket;
    if (selectedType) next.type = selectedType;
    if (searchQuery) next.q = searchQuery;
    setSearchParams(next, { replace: true });
  }, [selectedSupermarket, selectedType, searchQuery, setSearchParams]);

  const displayedWines = useMemo(() => {
    let list = wines;
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((w) =>
        (w.name || '').toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (w.supermarket || '').toLowerCase().includes(q)
      );
    }
    // Default sort: newest first by date_found
    return [...list].sort((a, b) => new Date(b.date_found) - new Date(a.date_found));
  }, [wines, debouncedQuery]);

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 p-4 animate-fade-in">
          {error}
        </div>
      )}
      {/* Hero Section with Vinly Branding */}
      <div className="text-center mb-10 sm:mb-14 pt-4 sm:pt-6 md:pt-8 animate-fade-in">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center mb-6 sm:mb-8 animate-scale-in">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-burgundy-600 via-burgundy-700 to-burgundy-800 bg-clip-text text-transparent leading-tight drop-shadow-sm py-2">
            Vinly
          </h1>
        </div>
        
        {/* Tagline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 animate-slide-up">
          Ontdek de beste supermarkt wijnen
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 leading-relaxed">
          Gecureerd door Nederlandse wijn influencers. Vind de beste deals en smaken uit jouw favoriete supermarkt.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 mb-8 sm:mb-10 space-y-6 sm:space-y-8 border border-gray-100 animate-slide-up">
        <SupermarketSelector
          selectedSupermarket={selectedSupermarket}
          onSupermarketChange={setSelectedSupermarket}
        />
        
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <WineTypeFilter
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>

        {/* Search */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek op naam, omschrijving of supermarkt"
              className="w-full md:flex-1 rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-burgundy-300"
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-burgundy-600 to-burgundy-800 rounded-full"></div>
            <p aria-live="polite" className="text-lg font-bold text-gray-800">
              {displayedWines.length} {displayedWines.length === 1 ? 'wijn' : 'wijnen'} gevonden
            </p>
          </div>
        </div>
      )}

      {/* Wine Grid */}
      <WineGrid wines={displayedWines} loading={loading} />
    </div>
  );
}

export default Home;

