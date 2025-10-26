import WineCard from './WineCard';

function WineGrid({ wines, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="text-7xl animate-bounce">🍷</div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-700">Wijnen laden...</p>
            <p className="text-sm text-gray-500">We zoeken de beste aanbevelingen voor je</p>
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-burgundy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-burgundy-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-burgundy-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
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

