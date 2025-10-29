import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { adminApi } from '../services/api';
import AdminWineEditor from '../components/AdminWineEditor';

const Admin = () => {
  const [wines, setWines] = useState([]);
  const [filteredWines, setFilteredWines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWine, setSelectedWine] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      loadWines();
    }
  }, []);

  // Filter wines based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredWines(
        wines.filter(wine =>
          wine.name.toLowerCase().includes(query) ||
          wine.supermarket.toLowerCase().includes(query) ||
          wine.influencer_source.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredWines(wines);
    }
  }, [searchQuery, wines]);

  const handleLogin = (e) => {
    e.preventDefault();
    adminApi.setToken(password);
    setIsAuthenticated(true);
    loadWines();
  };

  const loadWines = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllWines();
      setWines(data);
      setFilteredWines(data);
    } catch (error) {
      console.error('Failed to load wines:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setIsAuthenticated(false);
        toast.error('Invalid credentials. Please log in again.');
      } else {
        toast.error('Failed to load wines: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWine = async (wineId, updates) => {
    try {
      await adminApi.updateWine(wineId, updates);
      await loadWines();
      toast.success('Wine updated successfully!', { duration: 3000 });
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteWine = async (wineId) => {
    try {
      await adminApi.deleteWine(wineId);
      await loadWines();
      toast.success('Wine deleted successfully!', { duration: 3000 });
    } catch (error) {
      throw error;
    }
  };

  const handleAddTikTokPost = async (e) => {
    e.preventDefault();
    if (!tiktokUrl.trim()) return;

    try {
      setIsProcessing(true);
      
      // Simulate progress updates (actual processing happens on backend)
      setProcessingMessage('📥 Downloading video...');
      
      // Start the API call
      const apiPromise = adminApi.addTikTokPost(tiktokUrl);
      
      // Simulate progress messages while waiting
      const progressSteps = [
        { delay: 3000, message: '🎤 Transcribing audio with Whisper...' },
        { delay: 8000, message: '🤖 Extracting wine data with AI...' },
        { delay: 12000, message: '🔍 Finding optimal frame times...' },
        { delay: 15000, message: '📸 Extracting frames from video...' },
        { delay: 20000, message: '☁️ Uploading images to Cloudinary...' },
        { delay: 25000, message: '💾 Saving to database...' }
      ];
      
      progressSteps.forEach(({ delay, message }) => {
        setTimeout(() => {
          if (isProcessing) {
            setProcessingMessage(message);
          }
        }, delay);
      });
      
      const result = await apiPromise;
      
      setProcessingMessage('');
      setTiktokUrl('');
      await loadWines();
      
      if (result.wines_added > 0) {
        // Success - auto-dismiss after 5 seconds
        const wineNames = result.wines.map(w => `${w.name} (${w.supermarket})`).join(', ');
        toast.success(
          `Added ${result.wines_added} wine${result.wines_added > 1 ? 's' : ''}: ${wineNames}`,
          { duration: 5000 }
        );
      } else if (result.status === 'no_wines') {
        // Warning - manual close (user might want to read reasoning)
        toast.error(
          'No wines found in this video. Check backend logs for LLM reasoning.',
          { duration: Infinity } // Must manually close
        );
      } else {
        // Info - auto-dismiss after 4 seconds
        toast('Wine already exists in database', { 
          icon: 'ℹ️',
          duration: 4000 
        });
      }
    } catch (error) {
      console.error('Failed to add TikTok post:', error);
      // Error - manual close (user needs to read error details)
      toast.error(
        `Failed: ${error.response?.data?.detail || error.message}`,
        { duration: Infinity } // Must manually close
      );
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-burgundy-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-fraunces font-bold text-gray-900 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 transition-colors"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-500">
            Default password: <code className="bg-gray-100 px-2 py-1 rounded">admin</code>
          </p>
        </div>
      </div>
    );
  }

  // Main admin interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-burgundy-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-fraunces font-bold text-gray-900">Wine Admin Panel</h1>
            <button
              onClick={() => {
                localStorage.removeItem('admin_token');
                setIsAuthenticated(false);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <p className="text-sm text-amber-800">
              <strong>📝 Remember:</strong> After making changes, run <code className="bg-amber-100 px-2 py-1 rounded">.\scripts\deploy.ps1</code> to deploy to GitHub Pages.
            </p>
            <p className="text-xs text-amber-700 mt-2">
              The deploy script will export wines, build, verify, and push automatically.
            </p>
          </div>
        </div>

        {/* Add TikTok Post */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add TikTok Post</h2>
          <form onSubmit={handleAddTikTokPost} className="space-y-3">
            <div className="flex gap-3">
              <input
                type="url"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@user/video/..."
                disabled={isProcessing}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-2 bg-burgundy-600 text-white rounded-md hover:bg-burgundy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isProcessing ? 'Processing...' : 'Add Post'}
              </button>
            </div>
            
            {processingMessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center gap-3">
                  {/* Spinner */}
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-burgundy-600 border-t-transparent"></div>
                  <p className="text-sm text-blue-800 font-medium">{processingMessage}</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">This typically takes 30-90 seconds...</p>
              </div>
            )}
          </form>
        </div>

        {/* Wine List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Wines ({filteredWines.length})
            </h2>
            <button
              onClick={loadWines}
              className="text-sm text-burgundy-600 hover:text-burgundy-800"
            >
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wines by name, supermarket, or influencer..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading wines...</div>
          ) : filteredWines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No wines found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supermarket</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Influencer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredWines.map((wine) => (
                    <tr key={wine.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {wine.image_urls?.[0] && (
                          <img
                            src={wine.image_urls[0]}
                            alt={wine.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{wine.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{wine.supermarket}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{wine.wine_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{wine.influencer_source}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedWine(wine)}
                          className="text-sm text-burgundy-600 hover:text-burgundy-800 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedWine && (
        <AdminWineEditor
          wine={selectedWine}
          onSave={handleSaveWine}
          onDelete={handleDeleteWine}
          onClose={() => setSelectedWine(null)}
        />
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          // Success toasts (green)
          success: {
            iconTheme: {
              primary: '#7c2d12', // burgundy-800
              secondary: '#fff',
            },
            style: {
              border: '1px solid #86efac', // green-300
              background: '#f0fdf4', // green-50
            },
          },
          // Error toasts (red) - requires manual close for important errors
          error: {
            iconTheme: {
              primary: '#dc2626', // red-600
              secondary: '#fff',
            },
            style: {
              border: '1px solid #fca5a5', // red-300
              background: '#fef2f2', // red-50
            },
          },
          // Loading toasts (blue)
          loading: {
            iconTheme: {
              primary: '#7c2d12', // burgundy-800
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default Admin;

