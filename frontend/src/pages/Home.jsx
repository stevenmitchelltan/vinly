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
      <div className="text-center mb-8 sm:mb-12">
        {/* Logo and Brand */}
        <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
          <div className="text-5xl sm:text-6xl">🍷</div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-burgundy-600 to-burgundy-800 bg-clip-text text-transparent pb-4 leading-tight">
            Vinly
          </h1>
        </div>
        
        {/* Tagline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Ontdek de beste supermarkt wijnen
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
          Gecureerd door Nederlandse wijn influencers. Vind de beste deals en smaken uit jouw favoriete supermarkt.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8 space-y-4 sm:space-y-6">
        <SupermarketSelector
          selectedSupermarket={selectedSupermarket}
          onSupermarketChange={setSelectedSupermarket}
        />
        
        <div className="border-t border-gray-200 pt-4 sm:pt-6">
          <WineTypeFilter
            selectedType={selectedType}
            onTypeChange={setSelectedType}
          />
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            {wines.length} {wines.length === 1 ? 'wijn' : 'wijnen'} gevonden
          </p>
        </div>
      )}

      {/* Wine Grid */}
      <WineGrid wines={wines} loading={loading} />
    </div>
  );
}

export default Home;

