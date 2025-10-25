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
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Ontdek de beste supermarkt wijnen
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Gecureerd door Nederlandse wijn influencers. Vind de beste deals en smaken uit jouw favoriete supermarkt.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-6">
        <SupermarketSelector
          selectedSupermarket={selectedSupermarket}
          onSupermarketChange={setSelectedSupermarket}
        />
        
        <div className="border-t border-gray-200 pt-6">
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

