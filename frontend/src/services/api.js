import axios from 'axios';

// Base URL changes based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const IS_PRODUCTION = import.meta.env.VITE_USE_STATIC_DATA === 'true'; // Only use static data if explicitly set
const GITHUB_PAGES_BASE = import.meta.env.BASE_URL || '/vinly';

// DEBUG: Log environment variables
console.log('🔍 API.js Debug Info:');
console.log('  VITE_USE_STATIC_DATA:', import.meta.env.VITE_USE_STATIC_DATA);
console.log('  IS_PRODUCTION:', IS_PRODUCTION);
console.log('  BASE_URL:', import.meta.env.BASE_URL);
console.log('  GITHUB_PAGES_BASE:', GITHUB_PAGES_BASE);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchWines = async (supermarket = null, wineType = null) => {
  try {
    // In production (GitHub Pages), load from static JSON file
    if (IS_PRODUCTION) {
      const fetchUrl = `${GITHUB_PAGES_BASE}/wines.json`;
      console.log('🔍 Fetching wines from:', fetchUrl);
      const response = await fetch(fetchUrl);
      
      console.log('🔍 Fetch response status:', response.status, response.ok);
      if (!response.ok) {
        throw new Error('Failed to fetch wines.json');
      }
      
      let wines = await response.json();
      console.log('🔍 Wines loaded:', wines.length, 'wines');
      
      // Apply client-side filters
      if (supermarket) {
        wines = wines.filter(w => w.supermarket === supermarket);
      }
      if (wineType) {
        wines = wines.filter(w => w.wine_type === wineType);
      }
      
      return wines;
    } else {
      // Local development: use backend API
      const params = {};
      if (supermarket) params.supermarket = supermarket;
      if (wineType) params.type = wineType;
      
      const response = await api.get('/api/wines', { params });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching wines:', error);
    throw error;
  }
};

export const fetchSupermarkets = async () => {
  try {
    if (IS_PRODUCTION) {
      // Extract unique supermarkets from wines.json
      const wines = await fetchWines();
      const uniqueNames = [...new Set(wines.map(w => w.supermarket))].sort();
      // Transform to match backend format: {name, value}
      return uniqueNames.map(name => ({ name, value: name }));
    } else {
      // Local development: use backend API
      const response = await api.get('/api/supermarkets');
      return response.data.supermarkets;
    }
  } catch (error) {
    console.error('Error fetching supermarkets:', error);
    throw error;
  }
};

export const triggerScrape = async () => {
  try {
    const response = await api.post('/api/admin/trigger-scrape');
    return response.data;
  } catch (error) {
    console.error('Error triggering scrape:', error);
    throw error;
  }
};

// Admin API functions
const getAdminToken = () => {
  return localStorage.getItem('admin_token') || 'admin';
};

export const adminApi = {
  // Get all wines for admin
  async getAllWines() {
    try {
      const response = await api.get('/api/admin/wines', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching wines:', error);
      throw error;
    }
  },

  // Update wine
  async updateWine(wineId, updates) {
    try {
      const response = await api.put(`/api/admin/wines/${wineId}`, updates, {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating wine:', error);
      throw error;
    }
  },

  // Delete wine
  async deleteWine(wineId) {
    try {
      const response = await api.delete(`/api/admin/wines/${wineId}`, {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting wine:', error);
      throw error;
    }
  },

  // Add TikTok post
  async addTikTokPost(tiktokUrl) {
    try {
      const response = await api.post('/api/admin/add-tiktok-post', 
        { tiktok_url: tiktokUrl },
        {
          headers: {
            'Authorization': `Bearer ${getAdminToken()}`
          },
          timeout: 120000 // 2 minutes for processing
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding TikTok post:', error);
      throw error;
    }
  },

  // Duplicate wine (manual second wine for same video)
  async duplicateWine(wineId, suffix = '2') {
    try {
      const response = await api.post(`/api/admin/wines/${wineId}/duplicate`, null, {
        params: { suffix },
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error duplicating wine:', error);
      throw error;
    }
  },

  // Set admin token
  setToken(token) {
    localStorage.setItem('admin_token', token);
  }
};

export default api;

