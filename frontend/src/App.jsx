import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Admin from './pages/Admin'
import Footer from './components/Footer'

// Check if we're using static data (GitHub Pages) or API (local)
const IS_STATIC = import.meta.env.VITE_USE_STATIC_DATA === 'true';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          {/* Admin panel only available in local environment (not on GitHub Pages) */}
          <Route 
            path="/admin" 
            element={IS_STATIC ? <Navigate to="/" replace /> : <Admin />} 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

