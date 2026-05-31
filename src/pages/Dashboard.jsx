import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
  const [inscricoes, setInscricoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    fetchInscricoes()
  }, [user, authLoading])

  const fetchInscricoes = async () => {
    try {
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*, eventos(titulo, data, hora, local)')
        .eq('utilizador_id', user.id)

      if (error) throw error
      setInscricoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Meu Dashboard</h1>
              <p className="text-primary-100 mt-1">Bem-vindo, {user?.user_metadata?.nome || user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inscrições</p>
                <p className="text-3xl font-bold text-primary-600">{inscricoes.length}</p>
              </div>
              <div className="bg-primary-100 rounded-full p-3">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Confirmadas</p>
                <p className="text-3xl font-bold text-green-600">{inscricoes.filter(i => i.status === 'confirmada').length}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-600">{inscricoes.filter(i => i.status === 'pendente').length}</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Minhas Inscrições */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Minhas Inscrições</h2>
            <Link
              to="/eventos"
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Ver Eventos</span>
            </Link>
          </div>

          {inscricoes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg mb-4">Ainda não está inscrito em nenhum evento</p>
              <Link
                to="/eventos"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
              >
                Explorar Eventos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inscricoes.map((inscricao) => (
                <div key={inscricao.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-primary-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{inscricao.eventos?.titulo}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {inscricao.eventos?.data && new Date(inscricao.eventos.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {inscricao.eventos?.hora}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {inscricao.eventos?.local}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      inscricao.status === 'confirmada'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inscricao.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
