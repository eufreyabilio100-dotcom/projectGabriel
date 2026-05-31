import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function EventoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inscrito, setInscrito] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchEvento()
    checkUser()
  }, [id])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      checkInscricao(session.user.id)
    }
  }

  const fetchEvento = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setEvento(data)
    } catch (error) {
      console.error('Erro ao carregar evento:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkInscricao = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('evento_id', id)
        .eq('utilizador_id', userId)
        .single()

      if (data) setInscrito(true)
    } catch (error) {
      // Não inscrito
    }
  }

  const handleInscricao = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const { error } = await supabase
        .from('inscricoes')
        .insert([
          {
            utilizador_id: user.id,
            evento_id: id,
            status: 'confirmada'
          }
        ])

      if (error) throw error

      // Criar bilhete
      const { error: bilheteError } = await supabase
        .from('bilhetes')
        .insert([
          {
            inscricao_id: id,
            codigo_unico: `ISPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        ])

      if (bilheteError) throw bilheteError

      setInscrito(true)
      alert('Inscrição realizada com sucesso!')
    } catch (error) {
      alert('Erro ao inscrever-se: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">A carregar evento...</div>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Evento não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8">
            <h1 className="text-3xl font-bold mb-4">{evento.titulo}</h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(evento.data).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{evento.hora}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{evento.local}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre o Evento</h2>
              <p className="text-gray-600 leading-relaxed">{evento.descricao}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Capacidade</h3>
                <p className="text-2xl font-bold text-primary-600">{evento.capacidade}</p>
                <p className="text-sm text-gray-500">vagas disponíveis</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Data e Hora</h3>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(evento.data).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500">{evento.hora}</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              {inscrito ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
                  <p className="font-semibold">Já está inscrito neste evento!</p>
                  <p className="text-sm mt-1">Verifique o seu dashboard para mais detalhes.</p>
                </div>
              ) : (
                <button
                  onClick={handleInscricao}
                  className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
                >
                  Inscrever-se no Evento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
