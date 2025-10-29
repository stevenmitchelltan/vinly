import WineCard from './WineCard';

function WineGrid({ wines, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="animate-pulse">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl" style={{ aspectRatio: '4/5' }} />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-6 w-28 bg-gray-200 rounded-full" />
                <div className="h-7 w-7 bg-gray-200 rounded-full" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (wines.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-6 max-w-md bg-white rounded-2xl shadow-lg p-10 animate-scale-in border border-gray-100">
          <div className="text-7xl">🤷‍♂️</div>
          <h3 className="text-2xl font-bold text-gray-900">Geen wijnen gevonden</h3>
          <p className="text-gray-600 leading-relaxed">
            Er zijn geen wijnen gevonden met deze filters. Probeer een andere combinatie of kom later terug voor nieuwe aanbevelingen!
          </p>
          <div className="pt-4">
            <p className="text-sm text-burgundy-600 font-semibold">💡 Tip: Probeer alle filters te resetten</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wines.map((wine) => (
        <WineCard key={wine.id} wine={wine} />
      ))}
    </div>
  );
}

export default WineGrid;

