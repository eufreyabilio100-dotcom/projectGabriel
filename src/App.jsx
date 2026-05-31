import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ThemeProvider } from './lib/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import InstallPWA from './components/InstallPWA'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Eventos from './pages/Eventos'
import EventoDetalhe from './pages/EventoDetalhe'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'

function PageWrapper({ children }) {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  )
}

function App() {
  const location = useLocation()

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <PageWrapper key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registo" element={<Register />} />
                <Route path="/eventos" element={<Eventos />} />
                <Route path="/eventos/:id" element={<EventoDetalhe />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/perfil" element={<Profile />} />
              </Routes>
            </PageWrapper>
          </main>
          <Footer />
          <InstallPWA />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
