import { useState, useEffect, useMemo } from 'react';
import { fetchWines } from '../services/api';

const GOATCOUNTER_URL = 'https://stevenmitchelltan.goatcounter.com';
// GoatCounter API token — data is public, token is read-only
const GC_TOKEN = import.meta.env.VITE_GOATCOUNTER_TOKEN || '';

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

// --- Shared components ---

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
            <span className="text-sm font-medium text-th-text truncate mr-2">{label}</span>
            <span className="text-sm font-semibold text-th-text-sub flex-shrink-0">{value}</span>
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

function DailyChart({ days }) {
  if (!days.length) return null;
  const maxCount = Math.max(...days.map(d => d.count), 1);

  return (
    <div>
      <div className="flex items-end gap-[3px] h-32">
        {days.map((d, i) => (
          <div key={d.day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div
              className="w-full bg-th-accent/80 rounded-t-sm transition-all duration-500 ease-out min-h-[2px]"
              style={{
                height: `${Math.max((d.count / maxCount) * 100, 2)}%`,
                animationDelay: `${i * 20}ms`,
              }}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-th-elevated text-th-text text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {d.label}: {d.count}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-th-text-dim">
        <span>{days[0]?.label}</span>
        <span>{days[days.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function SectionCard({ title, delay, children }) {
  return (
    <div
      className="bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <h2 className="text-lg font-bold text-th-text mb-4">{title}</h2>
      {children}
    </div>
  );
}

// --- Helpers ---

function parseStats(stats, limit = 6) {
  return stats
    .filter(s => s.count > 0)
    .map(s => ({ label: s.name || 'Onbekend', value: s.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

// --- GoatCounter API helpers ---

async function gcFetch(endpoint, params = {}) {
  if (!GC_TOKEN || GC_TOKEN === 'PASTE_YOUR_TOKEN_HERE') return null;
  const url = new URL(`${GOATCOUNTER_URL}/api/v0/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${GC_TOKEN}` },
  });
  if (!res.ok) throw new Error(`GoatCounter API ${res.status}`);
  return res.json();
}

function getDateRange(daysBack) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

// --- Main component ---

function Analytics() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);

  // GoatCounter state
  const [gcTotal, setGcTotal] = useState(null);
  const [gcDaily, setGcDaily] = useState([]);
  const [gcPages, setGcPages] = useState([]);
  const [gcBrowsers, setGcBrowsers] = useState([]);
  const [gcSystems, setGcSystems] = useState([]);
  const [gcLocations, setGcLocations] = useState([]);
  const [gcSizes, setGcSizes] = useState([]);
  const [gcReferrers, setGcReferrers] = useState([]);
  const [gcAvailable, setGcAvailable] = useState(true);

  useEffect(() => {
    loadWines();
    loadGoatCounter();
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

  const loadGoatCounter = async () => {
    try {
      const { start, end } = getDateRange(30);

      const [totalData, hitsData, browserData, systemData, locationData, sizeData, refData] = await Promise.all([
        gcFetch('stats/total', { start, end }),
        gcFetch('stats/hits', { start, end, limit: 10 }),
        gcFetch('stats/browsers', { start, end }),
        gcFetch('stats/systems', { start, end }),
        gcFetch('stats/locations', { start, end }),
        gcFetch('stats/sizes', { start, end }),
        gcFetch('stats/toprefs', { start, end }),
      ]);

      if (!totalData) {
        setGcAvailable(false);
        return;
      }

      // Total
      setGcTotal(totalData);

      // Daily visitors — aggregate all paths into per-day totals
      if (hitsData?.hits) {
        const dailyMap = {};
        hitsData.hits.forEach(path => {
          (path.stats || []).forEach(stat => {
            const day = stat.day;
            dailyMap[day] = (dailyMap[day] || 0) + (stat.daily || 0);
          });
        });
        const dailyArr = Object.entries(dailyMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([day, count]) => ({
            day,
            count,
            label: new Date(day).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
          }));
        setGcDaily(dailyArr);

        // Top pages
        const pages = hitsData.hits
          .map(h => ({
            label: h.path === '/' || h.path === '/vinly/' ? 'Home' : (h.title || h.path.replace('/vinly/', '/')),
            value: h.count,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);
        setGcPages(pages);
      }

      // Browsers
      if (browserData?.stats) {
        setGcBrowsers(parseStats(browserData.stats));
      }

      // Operating systems
      if (systemData?.stats) {
        setGcSystems(parseStats(systemData.stats));
      }

      // Locations (countries)
      if (locationData?.stats) {
        setGcLocations(parseStats(locationData.stats));
      }

      // Screen sizes — uses id as label since name is empty
      if (sizeData?.stats) {
        const SIZE_LABELS = { phone: 'Telefoon', tablet: 'Tablet', desktop: 'Desktop', desktophd: 'Desktop HD', unknown: 'Onbekend' };
        const sizes = sizeData.stats
          .filter(s => s.count > 0)
          .map(s => ({ label: SIZE_LABELS[s.id] || s.id, value: s.count }))
          .sort((a, b) => b.value - a.value);
        setGcSizes(sizes);
      }

      // Top referrers
      if (refData?.stats) {
        const refs = refData.stats
          .filter(r => r.count > 0)
          .map(r => ({ label: r.name || 'Direct / onbekend', value: r.count }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);
        setGcReferrers(refs);
      }

    } catch (e) {
      console.error('GoatCounter API error:', e);
      setGcAvailable(false);
    }
  };

  // Wine stats (unchanged)
  const stats = useMemo(() => {
    if (!wines.length) return null;

    const bySupermarket = {};
    wines.forEach(w => {
      bySupermarket[w.supermarket] = (bySupermarket[w.supermarket] || 0) + 1;
    });
    const supermarketItems = Object.entries(bySupermarket)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value }));

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

    const byInfluencer = {};
    wines.forEach(w => {
      const name = (w.influencer_source || 'unknown').replace('_tiktok', '');
      byInfluencer[name] = (byInfluencer[name] || 0) + 1;
    });
    const influencerItems = Object.entries(byInfluencer)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([label, value]) => ({ label: `@${label}`, value }));

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

  // GoatCounter stats/total returns { total, total_events, total_utc }
  const totalViews = gcTotal?.total ?? null;

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
          label="Bezoekers"
          value={totalViews != null ? totalViews.toLocaleString('nl-NL') : '-'}
          sub="laatste 30 dagen"
          delay={200}
        />
        <StatCard
          label="Influencers"
          value={stats?.influencerItems.length || 0}
          sub={stats?.influencerItems[0]?.label ? `Top: ${stats.influencerItems[0].label}` : null}
          delay={250}
        />
      </div>

      {/* Daily visitors chart */}
      {gcDaily.length > 0 && (
        <SectionCard title="Bezoekers per dag (laatste 30 dagen)" delay={280}>
          <DailyChart days={gcDaily} />
        </SectionCard>
      )}

      {/* Visitor stats row */}
      {(gcPages.length > 0 || gcBrowsers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {gcPages.length > 0 && (
            <SectionCard title="Populaire pagina's" delay={320}>
              <BarChart items={gcPages} maxValue={Math.max(...gcPages.map(i => i.value))} />
            </SectionCard>
          )}
          {gcBrowsers.length > 0 && (
            <SectionCard title="Browsers" delay={360}>
              <BarChart items={gcBrowsers} maxValue={Math.max(...gcBrowsers.map(i => i.value))} />
            </SectionCard>
          )}
        </div>
      )}

      {/* OS, Locations, Sizes, Referrers */}
      {(gcSystems.length > 0 || gcLocations.length > 0 || gcSizes.length > 0 || gcReferrers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {gcSystems.length > 0 && (
            <SectionCard title="Besturingssystemen" delay={380}>
              <BarChart items={gcSystems} maxValue={Math.max(...gcSystems.map(i => i.value))} />
            </SectionCard>
          )}
          {gcLocations.length > 0 && (
            <SectionCard title="Landen" delay={400}>
              <BarChart items={gcLocations} maxValue={Math.max(...gcLocations.map(i => i.value))} />
            </SectionCard>
          )}
          {gcSizes.length > 0 && (
            <SectionCard title="Schermgrootte" delay={420}>
              <BarChart items={gcSizes} maxValue={Math.max(...gcSizes.map(i => i.value))} />
            </SectionCard>
          )}
          {gcReferrers.length > 0 && (
            <SectionCard title="Verwijzingen" delay={440}>
              <BarChart items={gcReferrers} maxValue={Math.max(...gcReferrers.map(i => i.value))} />
            </SectionCard>
          )}
        </div>
      )}

      {/* GoatCounter dashboard link */}
      {gcAvailable && (
        <a
          href={GOATCOUNTER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-6 mb-8 bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 hover:border-th-accent/40 transition-colors group animate-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-th-text mb-0.5">Volledig dashboard</h2>
              <p className="text-sm text-th-text-sub">
                Meer details op GoatCounter: apparaten, landen, talen en meer
              </p>
            </div>
            <svg className="w-5 h-5 text-th-text-dim group-hover:text-th-accent transition-colors flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
        </a>
      )}

      {/* Wine collection charts */}
      <h2 className="text-xl font-bold text-th-text mb-4 mt-4 animate-slide-up" style={{ animationDelay: '430ms' }}>
        Wijn collectie
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Per supermarkt" delay={460}>
          {stats && (
            <BarChart
              items={stats.supermarketItems}
              maxValue={Math.max(...stats.supermarketItems.map(i => i.value))}
            />
          )}
        </SectionCard>

        <SectionCard title="Per type" delay={490}>
          {stats && (
            <BarChart
              items={stats.typeItems}
              maxValue={Math.max(...stats.typeItems.map(i => i.value))}
            />
          )}
        </SectionCard>

        <SectionCard title="Per maand" delay={520}>
          {stats && stats.monthItems.length > 0 ? (
            <BarChart
              items={stats.monthItems}
              maxValue={Math.max(...stats.monthItems.map(i => i.value))}
            />
          ) : (
            <p className="text-sm text-th-text-dim">Geen datums beschikbaar</p>
          )}
        </SectionCard>

        <SectionCard title="Top influencers" delay={550}>
          {stats && (
            <BarChart
              items={stats.influencerItems}
              maxValue={Math.max(...stats.influencerItems.map(i => i.value))}
            />
          )}
        </SectionCard>
      </div>

      {/* Latest wine */}
      {stats?.latest && (
        <div className="mt-8 bg-th-surface border border-th-border rounded-2xl p-5 sm:p-6 animate-slide-up" style={{ animationDelay: '580ms' }}>
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
