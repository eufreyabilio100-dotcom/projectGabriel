import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function Home() {
  const [stats, setStats] = useState({ eventos: 0, participantes: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    setIsVisible(true)
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { count: eventos } = await supabase
      .from('eventos')
      .select('*', { count: 'exact', head: true })

    const { count: participantes } = await supabase
      .from('utilizadores')
      .select('*', { count: 'exact', head: true })

    setStats({ eventos: eventos || 0, participantes: participantes || 0 })
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-secondary-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl"></div>
        </div>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block bg-secondary-500/20 text-secondary-300 px-4 py-1 rounded-full text-sm font-medium mb-6">
            Instituto Superior de Tete
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Eventos Académicos
            <span className="block text-secondary-400">ISPT</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Descubra e participe nos melhores eventos académicos do Instituto Superior de Tete
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/eventos"
              className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-secondary-500/30 hover:-translate-y-1"
            >
              Ver Eventos
            </Link>
            {!user && (
              <Link
                to="/registo"
                className="border-2 border-white/80 hover:bg-white hover:text-primary-700 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:-translate-y-1"
              >
                Registar-se
              </Link>
            )}
            {user && (
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="border-2 border-white/80 hover:bg-white hover:text-primary-700 px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:-translate-y-1"
              >
                {isAdmin ? "Painel Admin" : "Meu Dashboard"}
              </Link>
            )}
          </div>

          {/* Stats Counter */}
          <div className="mt-16 grid grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-400">{stats.eventos}+</div>
              <div className="text-primary-200">Eventos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-400">{stats.participantes}+</div>
              <div className="text-primary-200">Participantes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Porquê usar a nossa plataforma?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tudo o que precisa para gerir eventos académicos num só lugar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-primary-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group">
              <div className="bg-primary-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Eventos Académicos</h3>
              <p className="text-gray-600">Encontre conferências, workshops e palestras na sua área de estudo</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-secondary-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group">
              <div className="bg-secondary-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary-200 transition-colors">
                <svg className="w-10 h-10 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Bilhetes Digitais</h3>
              <p className="text-gray-600">Inscreva-se e receba o seu bilhete digital instantaneamente</p>
            </div>

            <div className="text-center p-8 rounded-xl bg-gray-50 hover:bg-primary-50 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group">
              <div className="bg-primary-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors">
                <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Estatísticas</h3>
              <p className="text-gray-600">Painel completo para organizadores acompanharem os eventos</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {user ? "Explore os eventos disponíveis" : "Pronto para começar?"}
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            {user
              ? "Descubra os próximos eventos académicos do ISPT"
              : "Junte-se à comunidade académica do ISPT e nunca mais perca um evento importante"
            }
          </p>
          <Link
            to={user ? "/eventos" : "/registo"}
            className="inline-block bg-secondary-500 hover:bg-secondary-600 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            {user ? "Ver Eventos" : "Criar Conta Gratuita"}
          </Link>
        </div>
      </section>
    </div>
  )
}
