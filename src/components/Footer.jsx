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
            <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:Gabrielrogriguesussene@gmail.com" className="hover:text-white transition-colors">Gabrielrogriguesussene@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+258867699649" className="hover:text-white transition-colors">+258 86 769 9649</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Desenvolvedor</h3>
            <p className="text-gray-400 text-sm sm:text-base">Desenvolvido por: <span className="text-white font-medium">Rodrigues</span></p>
            <p className="text-gray-400 text-sm sm:text-base mt-1">Instituto Superior Politecnico de Tete</p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; {new Date().getFullYear()} ISPT Eventos. Todos os direitos reservados.</p>
          <p className="text-xs sm:text-sm mt-1">Desenvolvido por <span className="text-white">Rodrigues</span></p>
        </div>
      </div>
    </footer>
  )
}
