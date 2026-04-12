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
    <div className="container mx-auto px-4 sm:px-6 pb-12">
      {error && (
        <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/50 text-red-300 p-4 animate-fade-in">
          {error}
        </div>
      )}

      {/* Hero */}
      <div className="text-center pt-14 sm:pt-20 pb-10 sm:pb-14">
        <h1 className="text-7xl sm:text-8xl md:text-9xl font-black text-cream-100 tracking-tight leading-none mb-5 animate-scale-in">
          Vinly
        </h1>
        <p className="text-lg sm:text-xl text-cream-400 font-sans max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '150ms' }}>
          Ontdek de beste supermarkt wijnen
        </p>
        <div className="mt-8 w-12 h-px bg-gold-500 mx-auto animate-fade-in" style={{ animationDelay: '350ms' }} />
      </div>

      {/* Filters */}
      <div className="bg-stone-900/50 backdrop-blur-sm rounded-2xl border border-stone-800/80 p-5 sm:p-8 mb-10 space-y-6 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <SupermarketSelector
          selectedSupermarket={selectedSupermarket}
          onSupermarketChange={setSelectedSupermarket}
        />

        <div className="border-t border-stone-800" />

        <WineTypeFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

        <div className="border-t border-stone-800" />

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-cream-400 mb-3">
            Zoeken
          </label>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek op naam, omschrijving of supermarkt..."
            className="w-full rounded-xl bg-stone-800/60 border border-stone-700 px-5 py-3.5 text-cream-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-stone-600 transition-all"
          />
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <p aria-live="polite" className="text-sm text-cream-400">
            <span className="text-cream-100 font-semibold">{displayedWines.length}</span>{' '}
            {displayedWines.length === 1 ? 'wijn' : 'wijnen'} gevonden
          </p>
        </div>
      )}

      {/* Wine Grid */}
      <WineGrid wines={displayedWines} loading={loading} />
    </div>
  );
}

export default Home;
