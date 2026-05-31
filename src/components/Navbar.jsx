import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">ISPT Eventos</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
              Início
            </Link>
            <Link to="/eventos" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
              Eventos
            </Link>
            <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-600">
              Entrar
            </Link>
            <Link to="/registo" className="bg-secondary-500 hover:bg-secondary-600 px-4 py-2 rounded-md text-sm font-medium">
              Registar
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-primary-600"
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600">
              Início
            </Link>
            <Link to="/eventos" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600">
              Eventos
            </Link>
            <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-600">
              Entrar
            </Link>
            <Link to="/registo" className="block px-3 py-2 rounded-md text-base font-medium bg-secondary-500 hover:bg-secondary-600">
              Registar
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
