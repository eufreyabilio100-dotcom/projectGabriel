import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Eventos from './pages/Eventos'
import EventoDetalhe from './pages/EventoDetalhe'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registo" element={<Register />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/:id" element={<EventoDetalhe />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
