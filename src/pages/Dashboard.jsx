import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Toast from '../components/Toast'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout } = useAuth()
  const [inscricoes, setInscricoes] = useState([])
  const [bilhetes, setBilhetes] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inscricoes')
  const [toast, setToast] = useState(null)
  const [expandedBilhete, setExpandedBilhete] = useState(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [solicitacoes, setSolicitacoes] = useState([])
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestData, setRequestData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    local: '',
    capacidade: '50'
  })

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    fetchData()
  }, [user, authLoading])

  const fetchData = async () => {
    try {
      const { data: inscricoesData, error: inscError } = await supabase
        .from('inscricoes')
        .select('*, eventos(titulo, data, hora, local, capacidade)')
        .eq('utilizador_id', user.id)
        .order('created_at', { ascending: false })

      if (inscError) throw inscError
      setInscricoes(inscricoesData || [])

      if (inscricoesData?.length > 0) {
        const inscricaoIds = inscricoesData.map(i => i.id)
        const { data: bilhetesData } = await supabase
          .from('bilhetes')
          .select('*, inscricoes!inner(*, eventos(titulo, data, hora, local))')
          .in('inscricao_id', inscricaoIds)

        setBilhetes(bilhetesData || [])
      }

      // Fetch solicitations
      const { data: solicitacoesData } = await supabase
        .from('solicitacoes_eventos')
        .select('*')
        .eq('utilizador_id', user.id)
        .order('created_at', { ascending: false })

      setSolicitacoes(solicitacoesData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setToast({ message: 'Erro ao carregar dados', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleRequestEvent = async (e) => {
    e.preventDefault()
    setRequestLoading(true)
    try {
      const { error } = await supabase
        .from('solicitacoes_eventos')
        .insert([{
          ...requestData,
          capacidade: parseInt(requestData.capacidade),
          utilizador_id: user.id,
          status: 'pendente'
        }])

      if (error) throw error

      setShowRequestModal(false)
      setRequestData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '50' })
      fetchData()
      setToast({ message: 'Solicitacao enviada com sucesso! Aguarde aprovacao do admin.', type: 'success' })
    } catch (error) {
      setToast({ message: 'Erro ao enviar solicitacao: ' + error.message, type: 'error' })
    } finally {
      setRequestLoading(false)
    }
  }

  const getCountdown = (data, hora) => {
    const eventDate = new Date(data + 'T' + hora)
    const now = new Date()
    const diff = eventDate - now
    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h`
    return 'Em breve'
  }

  const getEventStatus = (data) => {
    const eventDate = new Date(data)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (eventDate < today) return 'past'
    if (eventDate.toDateString() === today.toDateString()) return 'today'
    return 'upcoming'
  }

  const stats = {
    total: inscricoes.length,
    confirmadas: inscricoes.filter(i => i.status === 'confirmada').length,
    pendentes: inscricoes.filter(i => i.status === 'pendente').length,
    bilhetes: bilhetes.length,
    solicitacoes: solicitacoes.length,
    solicitacoesPendentes: solicitacoes.filter(s => s.status === 'pendente').length
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {(user?.user_metadata?.nome || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Bem-vindo, {user?.user_metadata?.nome || 'Participante'}
                </h1>
                <p className="text-primary-200 text-sm mt-1">Gira as suas inscricoes e bilhetes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/eventos"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Ver Eventos
              </Link>
              <Link
                to="/perfil"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Perfil
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-primary-100 rounded-full p-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-1">Inscricoes</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 rounded-full p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400">Activas</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.confirmadas}</p>
            <p className="text-sm text-gray-500 mt-1">Confirmadas</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-yellow-100 rounded-full p-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400">Aguardam</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendentes}</p>
            <p className="text-sm text-gray-500 mt-1">Pendentes</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-secondary-100 rounded-full p-2">
                <svg className="w-5 h-5 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <span className="text-xs text-gray-400">Digitais</span>
            </div>
            <p className="text-3xl font-bold text-secondary-600">{stats.bilhetes}</p>
            <p className="text-sm text-gray-500 mt-1">Bilhetes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'inscricoes', label: 'Inscricoes', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
              { id: 'bilhetes', label: 'Bilhetes', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
              { id: 'solicitacoes', label: 'Solicitacoes', icon: 'M12 4v16m8-8H4' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.id === 'inscricoes' ? stats.total : tab.id === 'bilhetes' ? stats.bilhetes : stats.solicitacoesPendentes}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 lg:p-6">
            {/* Inscriptions Tab */}
            {activeTab === 'inscricoes' && (
              inscricoes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">Ainda nao esta inscrito em nenhum evento</p>
                  <p className="text-gray-400 text-sm mb-6">Explore os eventos disponiveis e inscreva-se!</p>
                  <Link
                    to="/eventos"
                    className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explorar Eventos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inscricoes.map((inscricao) => {
                    const status = getEventStatus(inscricao.eventos?.data)
                    const countdown = getCountdown(inscricao.eventos?.data, inscricao.eventos?.hora)

                    return (
                      <div key={inscricao.id} className="border border-gray-200 rounded-xl p-4 lg:p-5 hover:shadow-md transition-all hover:border-primary-300 group">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg group-hover:text-primary-600 transition-colors truncate">
                                {inscricao.eventos?.titulo}
                              </h3>
                              {status === 'today' && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">Hoje</span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {inscricao.eventos?.data && new Date(inscricao.eventos.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {inscricao.eventos?.hora}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {inscricao.eventos?.local}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {countdown && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {countdown}
                              </span>
                            )}
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              inscricao.status === 'confirmada'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {inscricao.status === 'confirmada' ? 'Confirmada' : 'Pendente'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* Tickets Tab */}
            {activeTab === 'bilhetes' && (
              bilhetes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">Nenhum bilhete disponivel</p>
                  <p className="text-gray-400 text-sm">Os seus bilhetes digitais aparecerao aqui apos a inscricao</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bilhetes.map((bilhete) => (
                    <div
                      key={bilhete.id}
                      className="border-2 border-dashed border-primary-200 rounded-xl p-5 bg-gradient-to-br from-primary-50 to-white hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setExpandedBilhete(expandedBilhete === bilhete.id ? null : bilhete.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary-100 rounded-full p-2">
                            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                          </div>
                          <span className="text-xs text-gray-400">Bilhete Digital</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          bilhete.inscricoes?.status === 'confirmada'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {bilhete.inscricoes?.status === 'confirmada' ? 'Valido' : 'Pendente'}
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-1">{bilhete.inscricoes?.eventos?.titulo}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span>{bilhete.inscricoes?.eventos?.data && new Date(bilhete.inscricoes.eventos.data).toLocaleDateString('pt-PT')}</span>
                        <span>-</span>
                        <span>{bilhete.inscricoes?.eventos?.hora}</span>
                      </div>

                      {/* QR Code area */}
                      {expandedBilhete === bilhete.id && (
                        <div className="mt-4 pt-4 border-t border-primary-100 animate-fadeIn">
                          <div className="bg-white rounded-lg p-4 text-center">
                            <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <svg className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">Codigo do Bilhete</p>
                            <p className="font-mono text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg break-all">
                              {bilhete.codigo_unico}
                            </p>
                            <p className="text-xs text-gray-400 mt-3">Apresente este codigo no evento</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">
                          {bilhete.inscricoes?.eventos?.local}
                        </span>
                        <span className="text-xs text-primary-600">
                          {expandedBilhete === bilhete.id ? 'Fechar' : 'Ver bilhete'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Solicitations Tab */}
            {activeTab === 'solicitacoes' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">As Minhas Solicitacoes</h3>
                    <p className="text-sm text-gray-500">Solicite eventos e acompanhe o status</p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Solicitar Evento
                  </button>
                </div>

                {solicitacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg mb-2">Nenhuma solicitacao</p>
                    <p className="text-gray-400 text-sm mb-6">Solicite um evento e aguarde a aprovacao do admin</p>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Solicitar Evento
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {solicitacoes.map((sol) => (
                      <div key={sol.id} className="border border-gray-200 rounded-xl p-4 lg:p-5 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg truncate">{sol.titulo}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                sol.status === 'aprovada' ? 'bg-green-100 text-green-700' :
                                sol.status === 'rejeitada' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {sol.status === 'aprovada' ? 'Aprovada' : sol.status === 'rejeitada' ? 'Rejeitada' : 'Pendente'}
                              </span>
                            </div>
                            {sol.descricao && (
                              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{sol.descricao}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(sol.data).toLocaleDateString('pt-PT')}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {sol.hora}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {sol.local}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {sol.capacidade} vagas
                              </span>
                            </div>
                            {sol.motivo_rejeicao && (
                              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700">
                                  <strong>Motivo da rejeicao:</strong> {sol.motivo_rejeicao}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(sol.created_at).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link to="/eventos" className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 rounded-full p-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Explorar Eventos</p>
                <p className="text-sm text-gray-500">Ver eventos disponiveis</p>
              </div>
            </div>
          </Link>

          <Link to="/perfil" className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
              <div className="bg-secondary-100 rounded-full p-3 group-hover:bg-secondary-200 transition-colors">
                <svg className="w-6 h-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-secondary-600 transition-colors">Meu Perfil</p>
                <p className="text-sm text-gray-500">Editar informacoes</p>
              </div>
            </div>
          </Link>

          <button onClick={handleLogout} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1 group text-left">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 rounded-full p-3 group-hover:bg-red-200 transition-colors">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">Terminar Sessao</p>
                <p className="text-sm text-gray-500">Sair da conta</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Request Event Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Solicitar Evento</h3>
                  <p className="text-sm text-gray-500 mt-1">Preencha os dados do evento desejado</p>
                </div>
                <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRequestEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titulo do Evento *</label>
                  <input
                    type="text"
                    required
                    value={requestData.titulo}
                    onChange={(e) => setRequestData({...requestData, titulo: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Ex: Workshop de Programacao"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <textarea
                    value={requestData.descricao}
                    onChange={(e) => setRequestData({...requestData, descricao: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    rows="3"
                    placeholder="Descreva o evento que deseja..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                    <input
                      type="date"
                      required
                      value={requestData.data}
                      onChange={(e) => setRequestData({...requestData, data: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
                    <input
                      type="time"
                      required
                      value={requestData.hora}
                      onChange={(e) => setRequestData({...requestData, hora: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local *</label>
                  <input
                    type="text"
                    required
                    value={requestData.local}
                    onChange={(e) => setRequestData({...requestData, local: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Ex: Auditorio ISPT"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade Pretendida</label>
                  <input
                    type="number"
                    value={requestData.capacidade}
                    onChange={(e) => setRequestData({...requestData, capacidade: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="50"
                    min="1"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-700">
                      A sua solicitacao sera analisada pelo administrador. Recebera uma notificacao quando for aprovada ou rejeitada.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {requestLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        A enviar...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Enviar Solicitacao
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
