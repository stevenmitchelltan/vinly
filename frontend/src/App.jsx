import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Admin from './pages/Admin'
import Footer from './components/Footer'
import ThemeToggle from './components/ThemeToggle'

const IS_STATIC = import.meta.env.VITE_USE_STATIC_DATA === 'true';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ThemeToggle />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
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
