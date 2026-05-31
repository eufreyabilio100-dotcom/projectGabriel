import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [inscricoes, setInscricoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      navigate('/login')
      return
    }
    setUser(session.user)
    fetchInscricoes(session.user.id)
  }

  const fetchInscricoes = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('inscricoes')
        .select(`
          *,
          eventos (*)
        `)
        .eq('utilizador_id', userId)

      if (error) throw error
      setInscricoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">A carregar...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meu Dashboard</h1>
              <p className="text-gray-600">Bem-vindo, {user?.user_metadata?.nome || user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Minhas Inscrições */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Minhas Inscrições</h2>

          {inscricoes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Ainda não está inscrito em nenhum evento.</p>
              <button
                onClick={() => navigate('/eventos')}
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md"
              >
                Ver Eventos Disponíveis
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {inscricoes.map((inscricao) => (
                <div key={inscricao.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{inscricao.eventos?.titulo}</h3>
                      <p className="text-sm text-gray-500">
                        {inscricao.eventos?.data && new Date(inscricao.eventos.data).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-500">{inscricao.eventos?.local}</p>
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
