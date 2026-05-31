import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useTheme } from '../lib/ThemeContext'
import { useCountUp } from '../hooks/useCountUp'
import ScrollReveal from '../components/ScrollReveal'

function AnimatedCounter({ end, suffix = '+', duration = 2000 }) {
  const count = useCountUp(end, duration)
  return <span>{count}{suffix}</span>
}

export default function Home() {
  const [stats, setStats] = useState({ eventos: 0, participantes: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { user, isAdmin } = useAuth()
  const { darkMode } = useTheme()

  useEffect(() => {
    setIsVisible(true)
    fetchStats()
  }, [])

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    setMousePos({
      x: (clientX / innerWidth - 0.5) * 20,
      y: (clientY / innerHeight - 0.5) * 20
    })
  }

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
    <div onMouseMove={handleMouseMove}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 via-primary-800 to-primary-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-10 left-10 w-72 h-72 bg-secondary-400 rounded-full blur-3xl transition-transform duration-1000"
            style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
          />
          <div
            className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400 rounded-full blur-3xl transition-transform duration-1000"
            style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-secondary-400/30 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block bg-secondary-500/20 text-secondary-300 px-4 py-1 rounded-full text-sm font-medium mb-6 animate-pulse">
            Instituto Superior Politecnico de Tete
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Eventos Académicos
            <span className="block text-secondary-400 animate-gradient">ISPT</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Descubra e participe nos melhores eventos académicos do Instituto Superior Politecnico de Tete
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/eventos"
              className="group bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-secondary-500/30 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Ver Eventos
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
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

          {/* Animated Stats Counter */}
          <div className="mt-16 grid grid-cols-2 gap-8 max-w-md mx-auto">
            <ScrollReveal delay={300}>
              <div className="text-center group">
                <div className="text-4xl font-bold text-secondary-400 group-hover:scale-110 transition-transform">
                  <AnimatedCounter end={stats.eventos} />
                </div>
                <div className="text-primary-200">Eventos</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={500}>
              <div className="text-center group">
                <div className="text-4xl font-bold text-secondary-400 group-hover:scale-110 transition-transform">
                  <AnimatedCounter end={stats.participantes} />
                </div>
                <div className="text-primary-200">Participantes</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Porque usar a nossa plataforma?</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Tudo o que precisa para gerir eventos academicos num so lugar</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ScrollReveal delay={100}>
              <div className="text-center p-6 sm:p-8 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-gray-600 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group cursor-pointer">
                <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 group-hover:rotate-6 transition-all">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 dark:text-white">Eventos Academicos</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Encontre conferencias, workshops e palestras na sua area de estudo</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center p-6 sm:p-8 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-secondary-50 dark:hover:bg-gray-600 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group cursor-pointer">
                <div className="bg-secondary-100 dark:bg-secondary-900 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-secondary-200 dark:group-hover:bg-secondary-800 group-hover:rotate-6 transition-all">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-600 dark:text-secondary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 dark:text-white">Bilhetes Digitais</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Inscreva-se e receba o seu bilhete digital instantaneamente</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="text-center p-6 sm:p-8 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-gray-600 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg group cursor-pointer sm:col-span-2 lg:col-span-1">
                <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 group-hover:rotate-6 transition-all">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 dark:text-white">Estatisticas</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Painel completo para organizadores acompanharem os eventos</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Como Funciona?</h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">Em apenas 3 passos simples</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: 1, title: 'Crie a sua Conta', desc: 'Registe-se gratuitamente na plataforma', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              { step: 2, title: 'Escolha um Evento', desc: 'Explore os eventos disponiveis e encontre o ideal', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
              { step: 3, title: 'Inscreva-se', desc: 'Receba o seu bilhete digital instantaneamente', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div className="relative text-center group">
                  <div className="bg-primary-600 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 text-lg sm:text-xl font-bold group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  {i < 2 && (
                    <div className="hidden lg:block absolute top-5 sm:top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-primary-200 dark:bg-primary-800" />
                  )}
                  <div className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 dark:text-white">{item.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-secondary-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              {user ? "Explore os eventos disponiveis" : "Pronto para comecar?"}
            </h2>
            <p className="text-base sm:text-lg text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              {user
                ? "Descubra os proximos eventos academicos do ISPT"
                : "Junte-se a comunidade academica do ISPT e nunca mais perca um evento importante"
              }
            </p>
            <Link
              to={user ? "/eventos" : "/registo"}
              className="inline-block bg-secondary-500 hover:bg-secondary-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {user ? "Ver Eventos" : "Criar Conta Gratuita"}
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
