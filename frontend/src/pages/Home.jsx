import { useState, useEffect } from 'react';
import SupermarketSelector from '../components/SupermarketSelector';
import WineTypeFilter from '../components/WineTypeFilter';
import WineGrid from '../components/WineGrid';
import { fetchWines } from '../services/api';

function Home() {
  const [wines, setWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupermarket, setSelectedSupermarket] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    loadWines();
  }, [selectedSupermarket, selectedType]);

  const loadWines = async () => {
    setLoading(true);
    try {
      const data = await fetchWines(selectedSupermarket, selectedType);
      setWines(data);
    } catch (error) {
      console.error('Failed to load wines:', error);
      setWines([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Hero Section with Vinly Branding */}
      <div className="text-center mb-8 sm:mb-12 pt-6 sm:pt-8 md:pt-12 animate-fade-in">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6 animate-scale-in">
          <div className="text-5xl sm:text-6xl drop-shadow-sm">🍷</div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-burgundy-600 via-burgundy-700 to-burgundy-800 bg-clip-text text-transparent pb-4 leading-tight drop-shadow-sm">
            Vinly
          </h1>
        </div>
        
        {/* Tagline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 animate-slide-up">
          Ontdek de beste supermarkt wijnen
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2 leading-relaxed">
          Gecureerd door Nederlandse wijn influencers. Vind de beste deals en smaken uit jouw favoriete supermarkt.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 mb-6 sm:mb-8 space-y-6 sm:space-y-8 border border-gray-100 animate-slide-up">
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
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mb-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-burgundy-600 to-burgundy-800 rounded-full"></div>
            <p className="text-lg font-bold text-gray-800">
              {wines.length} {wines.length === 1 ? 'wijn' : 'wijnen'} gevonden
            </p>
          </div>
        </div>
      )}

      {/* Wine Grid */}
      <WineGrid wines={wines} loading={loading} />
    </div>
  );
}

export default Home;

