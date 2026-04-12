import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useFavorites } from '../context/FavoritesContext';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { count } = useFavorites();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-40 bg-th-bg/80 backdrop-blur-md border-b border-th-border">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-fraunces text-xl font-bold text-th-accent hover:opacity-80 transition-opacity">
          Vinly
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-th-accent' : 'text-th-text-sub hover:text-th-text'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-th-accent' : 'text-th-text-sub hover:text-th-text'
              }`
            }
          >
            Over
          </NavLink>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {/* Favorites indicator */}
          {count > 0 && (
            <div className="p-2 relative" title={`${count} favorieten`}>
              <svg className="w-5 h-5 text-red-400 fill-red-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-burgundy-700 text-white text-[10px] font-bold">
                {count}
              </span>
            </div>
          )}

          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-th-elevated transition-colors"
            aria-label={mobileOpen ? 'Menu sluiten' : 'Menu openen'}
          >
            <svg className="w-5 h-5 text-th-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-th-border bg-th-bg/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-th-accent bg-th-elevated/60' : 'text-th-text-sub hover:text-th-text hover:bg-th-elevated/40'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-th-accent bg-th-elevated/60' : 'text-th-text-sub hover:text-th-text hover:bg-th-elevated/40'
                }`
              }
            >
              Over
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
