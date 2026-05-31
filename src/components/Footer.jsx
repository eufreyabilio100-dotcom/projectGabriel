import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ISPT Eventos</h3>
            <p className="text-gray-400">
              Plataforma de eventos académicos do Instituto Superior Politecnico de Tete
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">Início</Link>
              </li>
              <li>
                <Link to="/eventos" className="text-gray-400 hover:text-white">Eventos</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white">Entrar</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <p className="text-gray-400">Instituto Superior Politecnico de Tete</p>
            <p className="text-gray-400">Tete, Moçambique</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} ISPT Eventos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
