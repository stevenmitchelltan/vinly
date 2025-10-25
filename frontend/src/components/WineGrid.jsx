import WineCard from './WineCard';

function WineGrid({ wines, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce">🍷</div>
          <p className="text-gray-600 font-medium">Wijnen laden...</p>
        </div>
      </div>
    );
  }

  if (wines.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">🤷‍♂️</div>
          <h3 className="text-xl font-bold text-gray-800">Geen wijnen gevonden</h3>
          <p className="text-gray-600">
            Er zijn geen wijnen gevonden met deze filters. Probeer een andere combinatie of kom later terug!
          </p>
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

