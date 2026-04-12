import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Footer from './components/Footer'
import Navbar from './components/Navbar'

const Admin = lazy(() => import('./pages/Admin'))
const Analytics = lazy(() => import('./pages/Analytics'))

const IS_STATIC = import.meta.env.VITE_USE_STATIC_DATA === 'true';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse text-th-text-dim">Laden...</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route
              path="/admin"
              element={IS_STATIC ? <Navigate to="/" replace /> : <Admin />}
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
