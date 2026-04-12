import { createContext, useContext, useState, useCallback } from 'react';

const FavoritesContext = createContext(null);

const STORAGE_KEY = 'vinly-favorites';

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(loadFavorites);

  const toggleFavorite = useCallback((wineId) => {
    setFavorites((prev) => {
      const next = prev.includes(wineId)
        ? prev.filter((id) => id !== wineId)
        : [...prev, wineId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((wineId) => favorites.includes(wineId), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, count: favorites.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
