import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-4xl">🍷</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-burgundy-600 to-burgundy-800 bg-clip-text text-transparent">
                Vinly
              </h1>
              <p className="text-sm text-gray-600">Ontdek de beste supermarkt wijnen</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-burgundy-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-burgundy-600 font-medium transition-colors">
              Over Vinly
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;

