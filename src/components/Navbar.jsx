import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, isAdmin, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setShowUserMenu(false)
  }, [location])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setShowUserMenu(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinkClass = (path) =>
    `relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-white/20 text-white'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`

  const mobileLinkClass = (path) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-white/20 text-white'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-primary-800/95 backdrop-blur-md shadow-lg'
          : 'bg-primary-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center space-x-2 group">
                <div className="relative">
                  <svg className="w-9 h-9 text-secondary-400 group-hover:text-secondary-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                </div>
                <span className="text-xl font-bold group-hover:text-secondary-300 transition-colors">
                  ISPT <span className="text-secondary-400">Eventos</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className={navLinkClass('/')}>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Inicio
                </span>
                {isActive('/') && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-secondary-400 rounded-full" />}
              </Link>

              <Link to="/eventos" className={navLinkClass('/eventos')}>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Eventos
                </span>
                {isActive('/eventos') && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-secondary-400 rounded-full" />}
              </Link>

              {user && (
                <Link to={isAdmin ? "/admin" : "/dashboard"} className={navLinkClass(isAdmin ? '/admin' : '/dashboard')}>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    {isAdmin ? "Admin" : "Dashboard"}
                  </span>
                  {(isActive('/admin') || isActive('/dashboard')) && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-secondary-400 rounded-full" />}
                </Link>
              )}
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {(user.user_metadata?.nome || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white/90 group-hover:text-white max-w-[100px] truncate">
                      {user.user_metadata?.nome || 'Perfil'}
                    </span>
                    <svg className={`w-4 h-4 text-white/60 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.user_metadata?.nome || 'Utilizador'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/perfil"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Meu Perfil
                        </Link>
                        <Link
                          to={isAdmin ? "/admin" : "/dashboard"}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          {isAdmin ? 'Painel Admin' : 'Dashboard'}
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Terminar Sessao
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 transition-all duration-200">
                    Entrar
                  </Link>
                  <Link to="/registo" className="bg-secondary-500 hover:bg-secondary-600 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:shadow-lg hover:shadow-secondary-500/30 hover:-translate-y-0.5">
                    Registar
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={`block h-0.5 w-6 bg-white transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 w-6 bg-white transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-16 right-0 w-72 h-[calc(100vh-4rem)] bg-primary-800 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 h-full flex flex-col">
          {/* User Info (if logged in) */}
          {user && (
            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary-500 rounded-full flex items-center justify-center text-lg font-bold text-white">
                  {(user.user_metadata?.nome || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.user_metadata?.nome || 'Utilizador'}</p>
                  <p className="text-xs text-white/60 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1">
            <Link to="/" className={mobileLinkClass('/')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </Link>

            <Link to="/eventos" className={mobileLinkClass('/eventos')}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Eventos
            </Link>

            {user ? (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className={mobileLinkClass(isAdmin ? '/admin' : '/dashboard')}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {isAdmin ? 'Painel Admin' : 'Dashboard'}
                </Link>

                <Link to="/perfil" className={mobileLinkClass('/perfil')}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Meu Perfil
                </Link>
              </>
            ) : null}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {darkMode ? (
                <>
                  <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Modo Claro
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Modo Escuro
                </>
              )}
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Terminar Sessao
              </button>
            ) : (
              <>
                <Link to="/login" className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors">
                  Entrar
                </Link>
                <Link to="/registo" className="flex items-center justify-center w-full bg-secondary-500 hover:bg-secondary-600 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors">
                  Registar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}
