import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ISPT Eventos</h3>
            <p className="text-gray-400 text-sm sm:text-base">
              Plataforma de eventos academicos do Instituto Superior Politecnico de Tete
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rapidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/eventos" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors">Eventos</Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white text-sm sm:text-base transition-colors">Entrar</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <p className="text-gray-400 text-sm sm:text-base">Instituto Superior Politecnico de Tete</p>
            <p className="text-gray-400 text-sm sm:text-base">Tete, Mocambique</p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} ISPT Eventos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
