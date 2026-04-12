import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SupermarketSelector from '../components/SupermarketSelector';
import WineTypeFilter from '../components/WineTypeFilter';
import WineGrid from '../components/WineGrid';
import ErrorBoundary from '../components/ErrorBoundary';
import { fetchWines } from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import WineDetailModal from '../components/WineDetailModal';
import WineListView from '../components/WineListView';

const SORT_OPTIONS = [
  { value: 'date', label: 'Nieuwste eerst' },
  { value: 'supermarket', label: 'Supermarkt A-Z' },
  { value: 'type', label: 'Type wijn' },
];

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupermarket, setSelectedSupermarket] = useState(searchParams.get('supermarket'));
  const [selectedType, setSelectedType] = useState(searchParams.get('type'));
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedWine, setSelectedWine] = useState(null);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('vinly-view-mode') || 'grid');
  const { favorites, count: favCount } = useFavorites();

  const wineIdFromUrl = searchParams.get('wine');

  // Auto-open modal if ?wine=<id> in URL
  useEffect(() => {
    if (wineIdFromUrl && wines.length > 0 && !selectedWine) {
      const wine = wines.find(w => w.id === wineIdFromUrl);
      if (wine) setSelectedWine(wine);
    }
  }, [wineIdFromUrl, wines]);

  useEffect(() => {
    loadWines();
  }, [selectedSupermarket, selectedType]);

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

  useEffect(() => {
    const next = {};
    if (selectedSupermarket) next.supermarket = selectedSupermarket;
    if (selectedType) next.type = selectedType;
    if (searchQuery) next.q = searchQuery;
    if (sortBy !== 'date') next.sort = sortBy;
    if (selectedWine) next.wine = selectedWine.id;
    setSearchParams(next, { replace: true });
  }, [selectedSupermarket, selectedType, searchQuery, sortBy, selectedWine, setSearchParams]);

  // Derive supermarkets from loaded wines (avoids double fetch)
  const supermarkets = useMemo(() => {
    const uniqueNames = [...new Set(wines.map(w => w.supermarket))].sort();
    return uniqueNames.map(name => ({ name, value: name }));
  }, [wines]);

  const displayedWines = useMemo(() => {
    let list = wines;
    if (showFavorites) {
      list = list.filter((w) => favorites.includes(w.id));
    }
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((w) =>
        (w.name || '').toLowerCase().includes(q) ||
        (w.description || '').toLowerCase().includes(q) ||
        (w.supermarket || '').toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    switch (sortBy) {
      case 'supermarket':
        sorted.sort((a, b) => (a.supermarket || '').localeCompare(b.supermarket || ''));
        break;
      case 'type':
        sorted.sort((a, b) => (a.wine_type || '').localeCompare(b.wine_type || ''));
        break;
      default:
        sorted.sort((a, b) => new Date(b.date_found) - new Date(a.date_found));
    }
    return sorted;
  }, [wines, debouncedQuery, sortBy, showFavorites, favorites]);

  // Count active filters
  const activeFilterCount = [selectedSupermarket, selectedType, searchQuery].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 sm:px-6 pb-12">
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300 p-4 animate-fade-in">
          {error}
        </div>
      )}

      {/* Hero */}
      <div className="text-center pt-6 sm:pt-10 pb-4 sm:pb-6">
        <h1 className="text-4xl sm:text-5xl font-black text-th-text tracking-tight leading-none mb-2 animate-scale-in">
          Vinly
        </h1>
        <p className="text-base text-th-text-dim font-sans max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '150ms' }}>
          Ontdek de beste supermarkt wijnen
        </p>
      </div>

      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-th-surface border border-th-border text-sm font-medium text-th-text-sub hover:text-th-text transition-colors w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-burgundy-700 text-white text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </span>
          <svg className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Active filter chips (shown when filters collapsed) */}
        {!filtersOpen && activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {selectedSupermarket && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-th-elevated text-xs font-medium text-th-text-sub">
                {selectedSupermarket}
                <button onClick={() => setSelectedSupermarket(null)} className="hover:text-th-text" aria-label={`Verwijder filter ${selectedSupermarket}`}>&times;</button>
              </span>
            )}
            {selectedType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-th-elevated text-xs font-medium text-th-text-sub">
                {selectedType}
                <button onClick={() => setSelectedType(null)} className="hover:text-th-text" aria-label={`Verwijder filter ${selectedType}`}>&times;</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-th-elevated text-xs font-medium text-th-text-sub">
                &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="hover:text-th-text" aria-label="Verwijder zoekterm">&times;</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filters - sticky on desktop, collapsible on mobile */}
      <div className={`md:sticky md:top-[57px] md:z-30 bg-th-surface/50 backdrop-blur-sm rounded-2xl border border-th-border/80 p-5 sm:p-8 mb-6 space-y-6 animate-slide-up ${
        filtersOpen ? 'block' : 'hidden md:block'
      }`} style={{ animationDelay: '250ms' }}>
        <SupermarketSelector
          supermarkets={supermarkets}
          selectedSupermarket={selectedSupermarket}
          onSupermarketChange={setSelectedSupermarket}
        />

        <div className="border-t border-th-border" />

        <WineTypeFilter
          selectedType={selectedType}
          onTypeChange={setSelectedType}
        />

        <div className="border-t border-th-border" />

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-th-text-dim mb-3">
            Zoeken
          </label>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Zoek op naam, omschrijving of supermarkt..."
            className="w-full rounded-xl bg-th-elevated/60 border border-th-border-sub px-5 py-3.5 text-th-text placeholder:text-th-text-dim focus:outline-none focus:ring-2 focus:ring-th-accent/30 focus:border-th-border-sub transition-all"
          />
        </div>
      </div>

      {/* Results bar: count + favorites toggle + sort */}
      {!loading && (
        <div className="flex items-center justify-between mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <p aria-live="polite" className="text-sm text-th-text-dim">
            <span className="text-th-text font-semibold">{displayedWines.length}</span>{' '}
            {displayedWines.length === 1 ? 'wijn' : 'wijnen'} gevonden
          </p>
          <div className="flex items-center gap-2">
            {favCount > 0 && (
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  showFavorites
                    ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                    : 'bg-th-elevated/60 text-th-text-sub border border-th-border-sub hover:text-th-text'
                }`}
              >
                <svg className={`w-4 h-4 ${showFavorites ? 'fill-red-400 text-red-400' : ''}`} fill={showFavorites ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                {favCount}
              </button>
            )}
          {/* View toggle */}
          <div className="flex rounded-lg border border-th-border-sub overflow-hidden">
            <button
              onClick={() => { setViewMode('grid'); localStorage.setItem('vinly-view-mode', 'grid'); }}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-th-elevated text-th-text' : 'text-th-text-dim hover:text-th-text'}`}
              aria-label="Rasterweergave"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => { setViewMode('list'); localStorage.setItem('vinly-view-mode', 'list'); }}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-th-elevated text-th-text' : 'text-th-text-dim hover:text-th-text'}`}
              aria-label="Lijstweergave"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bg-th-elevated/60 border border-th-border-sub rounded-lg px-3 py-1.5 text-th-text-sub focus:outline-none focus:ring-2 focus:ring-th-accent/30"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          </div>
        </div>
      )}

      <ErrorBoundary>
        {viewMode === 'list' ? (
          <WineListView wines={displayedWines} loading={loading} onWineClick={setSelectedWine} />
        ) : (
          <WineGrid wines={displayedWines} loading={loading} onWineClick={setSelectedWine} />
        )}
      </ErrorBoundary>

      {selectedWine && (
        <WineDetailModal wine={selectedWine} onClose={() => setSelectedWine(null)} />
      )}
    </div>
  );
}

export default Home;
