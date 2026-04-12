import { useState, useEffect, useMemo } from 'react';
import { fetchWines } from '../services/api';

const GOATCOUNTER_URL = 'https://stevenmitchelltan.goatcounter.com';

const TYPE_COLORS = {
  red: 'bg-red-500',
  white: 'bg-amber-300',
  rose: 'bg-pink-300',
  sparkling: 'bg-yellow-200',
};

const TYPE_LABELS = {
  red: 'Rood',
  white: 'Wit',
  rose: 'Ros\u00e9',
  sparkling: 'Bubbels',
};

function StatCard({ label, value, sub, delay = 0 }) {
  return (
    <div
      className="bg-th-surface border border-th-border rounded-2xl p-5 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-sm font-medium text-th-text-dim uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-fraunces font-bold text-th-text">{value}</p>
      {sub && <p className="text-sm text-th-text-sub mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ items, maxValue }) {
  return (
    <div className="space-y-3">
      {items.map(({ label, value, color }, i) => (
        <div key={label} className="animate-slide-up" style={{ animationDelay: `${300 + i * 60}ms` }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-th-text">{label}</span>
            <span className="text-sm font-semibold text-th-text-sub">{value}</span>
          </div>
          <div className="h-2.5 bg-th-elevated rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${color || 'bg-th-accent'}`}
              style={{ width: `${Math.max((value / maxValue) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Analytics() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState(null);
  const [gcError, setGcError] = useState(false);

  useEffect(() => {
    loadWines();
    loadPageViews();
  }, []);

  const loadWines = async () => {
    try {
      const data = await fetchWines();
      setWines(data);
    } catch (e) {
      console.error('Failed to load wines:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadPageViews = async () => {
    try {
      const base = import.meta.env.BASE_URL || '/vinly';
      const res = await fetch(`${GOATCOUNTER_URL}/counter/${encodeURIComponent(base)}.json`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setPageViews(data);
    } catch {
      setGcError(true);
    }
  };

  const stats = useMemo(() => {
    if (!wines.length) return null;

    // By supermarket
    const bySupermarket = {};
    wines.forEach(w => {
      bySupermarket[w.supermarket] = (bySupermarket[w.supermarket] || 0) + 1;
    });
    const supermarketItems = Object.entries(bySupermarket)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value }));

    // By type
    const byType = {};
    wines.forEach(w => {
      const t = w.wine_type || 'unknown';
      byType[t] = (byType[t] || 0) + 1;
    });
    const typeItems = Object.entries(byType)
      .sort(([, a], [, b]) => b - a)
      .map(([type, value]) => ({
        label: TYPE_LABELS[type] || type,
        value,
        color: TYPE_COLORS[type] || 'bg-th-accent',
      }));

    // By month
    const byMonth = {};
    wines.forEach(w => {
      if (!w.date_found) return;
      const d = new Date(w.date_found);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
    const monthItems = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        const label = new Date(year, month - 1).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' });
        return { label, value };
      });

    // Top influencers
    const byInfluencer = {};
    wines.forEach(w => {
      const name = (w.influencer_source || 'unknown').replace('_tiktok', '');
      byInfluencer[name] = (byInfluencer[name] || 0) + 1;
    });
    const influencerItems = Object.entries(byInfluencer)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({ label: `@${label}`, value }));

    // Latest wine
    const sorted = [...wines].sort((a, b) => new Date(b.date_found) - new Date(a.date_found));
    const latest = sorted[0];

    return { supermarketItems, typeItems, monthItems, influencerItems, latest };
  }, [wines]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-20">
        <div className="flex justify-center">
          <div className="animate-pulse text-th-text-dim">Laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 pb-12">
      {/* Header */}
      <div className="text-center pt-6 sm:pt-10 pb-6 sm:pb-10">
        <h1 className="text-4xl sm:text-5xl font-black text-th-text tracking-tight leading-none mb-2 animate-scale-in">
          Analytics
        </h1>
        <p className="text-base text-th-text-dim font-sans max-w-sm mx-auto animate-slide-up" style={{ animationDelay: '150ms' }}>
          Statistieken van de Vinly collectie
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard label="Wijnen" value={wines.length} delay={100} />
        <StatCard
          label="Supermarkten"
          value={stats?.supermarketItems.length || 0}
          delay={150}
        />
        <StatCard
          label="Influencers"
          value={stats?.influencerItems.length || 0}
          sub={stats?.influencerItems[0]?.label ? `Top: ${stats.influencerItems[0].label}` : null}
          delay={200}
        />
        <StatCard
          label="Paginaweergaven"
          value={pageViews ? pageViews.count : gcError ? '-' : '...'}
          sub={
            pageViews
              ? <a href={GOATCOUNTER_URL} target="_blank" rel="noopener noreferrer" className="text-th-accent hover:underline">Dashboard bekijken</a>
              : gcError
                ? 'Niet beschikbaar'
                : null
          }
          delay={250}
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By supermarket */}
        <div className="bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-bold text-th-text mb-4">Per supermarkt</h2>
          {stats && (
            <BarChart
              items={stats.supermarketItems}
              maxValue={Math.max(...stats.supermarketItems.map(i => i.value))}
            />
          )}
        </div>

        {/* By type */}
        <div className="bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <h2 className="text-lg font-bold text-th-text mb-4">Per type</h2>
          {stats && (
            <BarChart
              items={stats.typeItems}
              maxValue={Math.max(...stats.typeItems.map(i => i.value))}
            />
          )}
        </div>

        {/* By month */}
        <div className="bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-lg font-bold text-th-text mb-4">Per maand</h2>
          {stats && stats.monthItems.length > 0 ? (
            <BarChart
              items={stats.monthItems}
              maxValue={Math.max(...stats.monthItems.map(i => i.value))}
            />
          ) : (
            <p className="text-sm text-th-text-dim">Geen datums beschikbaar</p>
          )}
        </div>

        {/* Top influencers */}
        <div className="bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '450ms' }}>
          <h2 className="text-lg font-bold text-th-text mb-4">Top influencers</h2>
          {stats && (
            <BarChart
              items={stats.influencerItems}
              maxValue={Math.max(...stats.influencerItems.map(i => i.value))}
            />
          )}
        </div>
      </div>

      {/* Latest wine */}
      {stats?.latest && (
        <div className="mt-8 bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <h2 className="text-lg font-bold text-th-text mb-2">Laatste toevoeging</h2>
          <div className="flex items-center gap-4">
            {stats.latest.image_urls?.[0] && (
              <img
                src={stats.latest.image_urls[0]}
                alt={stats.latest.name}
                className="w-14 h-14 rounded-xl object-cover border border-th-border"
              />
            )}
            <div>
              <p className="font-semibold text-th-text">{stats.latest.name}</p>
              <p className="text-sm text-th-text-sub">
                {stats.latest.supermarket}
                {stats.latest.date_found && (
                  <> &middot; {new Date(stats.latest.date_found).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
