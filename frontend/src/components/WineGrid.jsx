import WineCard from './WineCard';
import { useInView } from '../hooks/useInView';

function AnimatedCard({ children }) {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  );
}

function WineGrid({ wines, loading, onWineClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-2xl overflow-hidden bg-th-elevated relative" style={{ aspectRatio: '3/4' }}>
            {/* Simulates gradient scrim area */}
            <div className="absolute inset-x-0 bottom-0 p-4 space-y-2">
              <div className="h-3 bg-th-border-sub/40 rounded w-1/3" />
              <div className="h-5 bg-th-border-sub/50 rounded w-4/5" />
              <div className="h-4 bg-th-border-sub/30 rounded w-3/5" />
            </div>
            {/* Top badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between">
              <div className="h-6 w-24 bg-th-border-sub/40 rounded-full" />
              <div className="h-8 w-8 bg-th-border-sub/40 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wines.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-6 max-w-md bg-th-surface rounded-2xl p-10 animate-scale-in border border-th-border">
          <div className="text-7xl">🤷‍♂️</div>
          <h3 className="text-2xl font-bold text-th-text">Geen wijnen gevonden</h3>
          <p className="text-th-text-dim leading-relaxed">
            Er zijn geen wijnen gevonden met deze filters. Probeer een andere combinatie of kom later terug voor nieuwe aanbevelingen!
          </p>
          <div className="pt-4">
            <p className="text-sm text-th-accent font-semibold">💡 Tip: Probeer alle filters te resetten</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wines.map((wine) => (
        <AnimatedCard key={wine.id}>
          <WineCard wine={wine} onClick={onWineClick} />
        </AnimatedCard>
      ))}
    </div>
  );
}

export default WineGrid;
