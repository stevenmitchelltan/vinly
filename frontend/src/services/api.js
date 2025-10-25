import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchWines = async (supermarket = null, wineType = null) => {
  try {
    const params = {};
    if (supermarket) params.supermarket = supermarket;
    if (wineType) params.type = wineType;
    
    const response = await api.get('/api/wines', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching wines:', error);
    throw error;
  }
};

export const fetchSupermarkets = async () => {
  try {
    const response = await api.get('/api/supermarkets');
    return response.data.supermarkets;
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

