import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useFavorites } from '../context/FavoritesContext';

function Navbar() {
  const { count } = useFavorites();

  return (
    <nav className="sticky top-0 z-40 bg-th-bg/80 backdrop-blur-md border-b border-th-border">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-fraunces text-xl font-bold text-th-accent hover:opacity-80 transition-opacity">
          Vinly
        </Link>

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

          {/* Analytics link */}
          <Link
            to="/analytics"
            className="p-2 text-th-text-dim hover:text-th-accent transition-colors"
            title="Analytics"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
