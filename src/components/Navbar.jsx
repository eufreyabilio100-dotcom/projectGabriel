import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        checkAdmin(session.user.id)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      checkAdmin(session.user.id)
    }
  }

  const checkAdmin = async (userId) => {
    const { data } = await supabase
      .from('utilizadores')
      .select('tipo')
      .eq('id', userId)
      .single()
    setIsAdmin(data?.tipo === 'admin')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    navigate('/')
  }

  return (
    <nav className="bg-primary-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <svg className="w-8 h-8 text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xl font-bold">ISPT Eventos</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
              Início
            </Link>
            <Link to="/eventos" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
              Eventos
            </Link>

            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
                <div className="flex items-center space-x-3 ml-2">
                  <span className="text-sm text-primary-200">{user.user_metadata?.nome || user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600 transition-colors duration-200">
                  Entrar
                </Link>
                <Link to="/registo" className="bg-secondary-500 hover:bg-secondary-600 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-lg">
                  Registar
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden animate-slideDown">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-colors">
              Início
            </Link>
            <Link to="/eventos" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-colors">
              Eventos
            </Link>

            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-colors">
                  {isAdmin ? "Admin" : "Dashboard"}
                </Link>
                <div className="px-3 py-2">
                  <p className="text-sm text-primary-200 mb-2">{user.user_metadata?.nome || user.email}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600 transition-colors">
                  Entrar
                </Link>
                <Link to="/registo" className="block px-3 py-2 rounded-md text-base font-medium bg-secondary-500 hover:bg-secondary-600 transition-colors">
                  Registar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
