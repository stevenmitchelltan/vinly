import axios from 'axios';

// Base URL changes based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const IS_PRODUCTION = import.meta.env.PROD;
const GITHUB_PAGES_BASE = '/vinly';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchWines = async (supermarket = null, wineType = null) => {
  try {
    // In production (GitHub Pages), load from static JSON file
    if (IS_PRODUCTION) {
      const response = await fetch(`${GITHUB_PAGES_BASE}/wines.json`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wines.json');
      }
      
      let wines = await response.json();
      
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

export default api;

