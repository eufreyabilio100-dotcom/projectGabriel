import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Toast from '../components/Toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAdmin, loading: authLoading, logout } = useAuth()
  const [eventos, setEventos] = useState([])
  const [inscricoes, setInscricoes] = useState([])
  const [utilizadores, setUtilizadores] = useState([])
  const [stats, setStats] = useState({ totalEventos: 0, totalInscricoes: 0, totalUtilizadores: 0 })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showModal, setShowModal] = useState(false)
  const [editingEvento, setEditingEvento] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)
  const [solicitacoes, setSolicitacoes] = useState([])
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    local: '',
    capacidade: '',
    tipo: 'academico'
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login')
      return
    }
    if (!isAdmin) {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [user, isAdmin, authLoading])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter menos de 5MB', 'error')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async () => {
    if (!imageFile) return null

    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `eventos/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('eventos-imagens')
      .upload(filePath, imageFile)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('eventos-imagens')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const fetchData = async () => {
    try {
      const [eventosRes, inscricoesRes, utilizadoresRes, solicitacoesRes] = await Promise.all([
        supabase.from('eventos').select('*').order('created_at', { ascending: false }),
        supabase.from('inscricoes').select('*, utilizadores(nome, email), eventos(titulo)'),
        supabase.from('utilizadores').select('*').order('created_at', { ascending: false }),
        supabase.from('solicitacoes_eventos').select('*').order('created_at', { ascending: false })
      ])

      console.log('Solicitacoes response:', solicitacoesRes)

      setEventos(eventosRes.data || [])
      setInscricoes(inscricoesRes.data || [])
      setUtilizadores(utilizadoresRes.data || [])
      setSolicitacoes(solicitacoesRes.data || [])
      setStats({
        totalEventos: eventosRes.data?.length || 0,
        totalInscricoes: inscricoesRes.data?.length || 0,
        totalUtilizadores: utilizadoresRes.data?.length || 0,
        totalSolicitacoes: solicitacoesRes.data?.length || 0,
        solicitacoesPendentes: solicitacoesRes.data?.filter(s => s.status === 'pendente').length || 0
      })
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvento = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      let imagem_url = null
      if (imageFile) {
        imagem_url = await uploadImage()
      }

      const { error } = await supabase
        .from('eventos')
        .insert([{
          ...formData,
          capacidade: parseInt(formData.capacidade),
          organizador_id: user.id,
          imagem_url
        }])

      if (error) throw error

      setShowModal(false)
      setFormData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '', tipo: 'academico' })
      clearImage()
      fetchData()
      showToast('Evento criado com sucesso!')
    } catch (error) {
      showToast('Erro ao criar evento: ' + error.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateEvento = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      let imagem_url = editingEvento.imagem_url
      if (imageFile) {
        imagem_url = await uploadImage()
      }

      const { error } = await supabase
        .from('eventos')
        .update({
          ...formData,
          capacidade: parseInt(formData.capacidade),
          imagem_url
        })
        .eq('id', editingEvento.id)

      if (error) throw error

      setShowModal(false)
      setEditingEvento(null)
      setFormData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '', tipo: 'academico' })
      clearImage()
      fetchData()
      showToast('Evento actualizado com sucesso!')
    } catch (error) {
      showToast('Erro ao actualizar evento: ' + error.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteEvento = async (id) => {
    if (!confirm('Tem certeza que deseja eliminar este evento?')) return

    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchData()
      showToast('Evento eliminado com sucesso!')
    } catch (error) {
      showToast('Erro ao eliminar evento: ' + error.message, 'error')
    }
  }

  const openEditModal = (evento) => {
    setEditingEvento(evento)
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao,
      data: evento.data,
      hora: evento.hora,
      local: evento.local,
      capacidade: evento.capacidade.toString(),
      tipo: evento.tipo || 'academico'
    })
    setImagePreview(evento.imagem_url || null)
    setImageFile(null)
    setShowModal(true)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleApproveSolicitacao = async (solicitacao) => {
    try {
      // Create the event
      const { error: eventError } = await supabase
        .from('eventos')
        .insert([{
          titulo: solicitacao.titulo,
          descricao: solicitacao.descricao,
          data: solicitacao.data,
          hora: solicitacao.hora,
          local: solicitacao.local,
          capacidade: solicitacao.capacidade,
          organizador_id: user.id
        }])

      if (eventError) throw eventError

      // Update solicitation status
      const { error: updateError } = await supabase
        .from('solicitacoes_eventos')
        .update({ status: 'aprovada' })
        .eq('id', solicitacao.id)

      if (updateError) throw updateError

      fetchData()
      showToast('Solicitacao aprovada e evento criado!')
    } catch (error) {
      showToast('Erro ao aprovar solicitacao: ' + error.message, 'error')
    }
  }

  const handleRejectSolicitacao = async () => {
    if (!rejectReason.trim()) {
      showToast('Indique o motivo da rejeicao', 'error')
      return
    }

    try {
      const { error } = await supabase
        .from('solicitacoes_eventos')
        .update({
          status: 'rejeitada',
          motivo_rejeicao: rejectReason.trim()
        })
        .eq('id', rejectingId)

      if (error) throw error

      setShowRejectModal(false)
      setRejectingId(null)
      setRejectReason('')
      fetchData()
      showToast('Solicitacao rejeitada')
    } catch (error) {
      showToast('Erro ao rejeitar solicitacao: ' + error.message, 'error')
    }
  }

  const filteredEventos = eventos.filter(e =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.local.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar painel...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Visao Geral', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'eventos', label: 'Eventos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'solicitacoes', label: 'Solicitacoes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', badge: stats.solicitacoesPendentes },
    { id: 'inscricoes', label: 'Inscricoes', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { id: 'utilizadores', label: 'Utilizadores', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
                {(user?.user_metadata?.nome || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Painel de Administracao
                </h1>
                <p className="text-purple-200 text-sm mt-1">Gerir eventos e utilizadores do ISPT</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/eventos"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm backdrop-blur-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Site
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
        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
                {tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 lg:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="animate-fadeIn">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-100 text-sm">Total de Eventos</p>
                        <p className="text-3xl lg:text-4xl font-bold mt-2">{stats.totalEventos}</p>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-secondary-100 text-sm">Total de Inscricoes</p>
                        <p className="text-3xl lg:text-4xl font-bold mt-2">{stats.totalInscricoes}</p>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Total de Utilizadores</p>
                        <p className="text-3xl lg:text-4xl font-bold mt-2">{stats.totalUtilizadores}</p>
                      </div>
                      <div className="bg-white/20 rounded-full p-3">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Events */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos Recentes</h3>
                  <div className="space-y-3">
                    {eventos.slice(0, 5).map((evento) => (
                      <div key={evento.id} className="flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition-all">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{evento.titulo}</p>
                          <p className="text-sm text-gray-500 truncate">{evento.local} - {new Date(evento.data).toLocaleDateString('pt-PT')}</p>
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">Activo</span>
                      </div>
                    ))}
                    {eventos.length === 0 && (
                      <p className="text-gray-500 text-center py-4">Nenhum evento criado</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Eventos Tab */}
            {activeTab === 'eventos' && (
              <div className="animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Pesquisar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => { setEditingEvento(null); setFormData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '', tipo: 'academico' }); clearImage(); setShowModal(true); }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all hover:shadow-lg flex items-center space-x-2 w-full sm:w-auto justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Criar Evento</span>
                  </button>
                </div>

                {/* Mobile Cards / Desktop Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Local</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accoes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredEventos.map((evento) => (
                          <tr key={evento.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{evento.titulo}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{evento.descricao}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(evento.data).toLocaleDateString('pt-PT')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{evento.local}</td>
                            <td className="px-6 py-4">
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{evento.capacidade}</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium space-x-3 whitespace-nowrap">
                              <button onClick={() => openEditModal(evento)} className="text-blue-600 hover:text-blue-900 transition-colors">Editar</button>
                              <button onClick={() => handleDeleteEvento(evento.id)} className="text-red-600 hover:text-red-900 transition-colors">Eliminar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {filteredEventos.map((evento) => (
                      <div key={evento.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 flex-1">{evento.titulo}</h4>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full ml-2">{evento.capacidade} vagas</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{evento.descricao}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span>{new Date(evento.data).toLocaleDateString('pt-PT')}</span>
                          <span>-</span>
                          <span>{evento.local}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditModal(evento)} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">Editar</button>
                          <button onClick={() => handleDeleteEvento(evento.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">Eliminar</button>
                        </div>
                      </div>
                    ))}
                    {filteredEventos.length === 0 && (
                      <p className="text-gray-500 text-center py-8">Nenhum evento encontrado</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Solicitacoes Tab */}
            {activeTab === 'solicitacoes' && (
              <div className="animate-fadeIn">
                {solicitacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">Nenhuma solicitacao recebida</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {solicitacoes.map((sol) => (
                      <div key={sol.id} className={`border rounded-xl p-5 transition-all hover:shadow-md ${
                        sol.status === 'pendente' ? 'border-yellow-300 bg-yellow-50/50' :
                        sol.status === 'aprovada' ? 'border-green-300 bg-green-50/50' :
                        'border-red-300 bg-red-50/50'
                      }`}>
                        <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{sol.titulo}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                sol.status === 'aprovada' ? 'bg-green-100 text-green-700' :
                                sol.status === 'rejeitada' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {sol.status === 'aprovada' ? 'Aprovada' : sol.status === 'rejeitada' ? 'Rejeitada' : 'Pendente'}
                              </span>
                            </div>

                            <p className="text-sm text-gray-500 mb-1">
                              <strong>Solicitado por:</strong> {sol.utilizadores?.nome || 'N/A'} ({sol.utilizadores?.email})
                            </p>

                            {sol.descricao && (
                              <p className="text-sm text-gray-500 mb-2">{sol.descricao}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(sol.data).toLocaleDateString('pt-PT')}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {sol.hora}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {sol.local}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {sol.capacidade} vagas
                              </span>
                            </div>

                            {sol.motivo_rejeicao && (
                              <div className="mt-3 bg-red-100 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-700">
                                  <strong>Motivo da rejeicao:</strong> {sol.motivo_rejeicao}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          {sol.status === 'pendente' && (
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleApproveSolicitacao(sol)}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Aprovar
                              </button>
                              <button
                                onClick={() => { setRejectingId(sol.id); setShowRejectModal(true); }}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Rejeitar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Inscricoes Tab */}
            {activeTab === 'inscricoes' && (
              <div className="animate-fadeIn">
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inscricoes.map((inscricao) => (
                          <tr key={inscricao.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900">{inscricao.utilizadores?.nome || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{inscricao.eventos?.titulo || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${inscricao.status === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {inscricao.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(inscricao.created_at).toLocaleDateString('pt-PT')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {inscricoes.map((inscricao) => (
                      <div key={inscricao.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-900">{inscricao.utilizadores?.nome || 'N/A'}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${inscricao.status === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {inscricao.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{inscricao.eventos?.titulo || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(inscricao.created_at).toLocaleDateString('pt-PT')}</p>
                      </div>
                    ))}
                    {inscricoes.length === 0 && (
                      <p className="text-gray-500 text-center py-8">Nenhuma inscricao</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Utilizadores Tab */}
            {activeTab === 'utilizadores' && (
              <div className="animate-fadeIn">
                <div className="bg-white rounded-xl shadow overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {utilizadores.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.nome}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${u.tipo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                {u.tipo}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {new Date(u.created_at).toLocaleDateString('pt-PT')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {utilizadores.map((u) => (
                      <div key={u.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-gray-900">{u.nome}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${u.tipo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {u.tipo}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(u.created_at).toLocaleDateString('pt-PT')}</p>
                      </div>
                    ))}
                    {utilizadores.length === 0 && (
                      <p className="text-gray-500 text-center py-8">Nenhum utilizador</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/eventos" className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-all hover:-translate-y-1 group">
            <div className="flex items-center gap-4">
              <div className="bg-primary-100 rounded-full p-3 group-hover:bg-primary-200 transition-colors">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Ver Site</p>
                <p className="text-sm text-gray-500">Visualizar como participante</p>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingEvento ? 'Editar Evento' : 'Criar Novo Evento'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingEvento(null); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingEvento ? handleUpdateEvento : handleCreateEvento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Nome do evento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <textarea
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    rows="3"
                    placeholder="Descreva o evento"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      required
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                      type="time"
                      required
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                  <input
                    type="text"
                    required
                    value={formData.local}
                    onChange={(e) => setFormData({...formData, local: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="Local do evento"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
                    <input
                      type="number"
                      required
                      value={formData.capacidade}
                      onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                      placeholder="Numero de vagas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all bg-white"
                    >
                      <option value="academico">Academico</option>
                      <option value="desporto">Desporto</option>
                      <option value="cultural">Cultural</option>
                      <option value="workshop">Workshop</option>
                      <option value="conferencia">Conferencia</option>
                      <option value="palestra">Palestra</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Evento</label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-600 mb-1">Clique para fazer upload</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WEBP (max. 5MB)</p>
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingEvento(null); }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        A guardar...
                      </>
                    ) : (
                      editingEvento ? 'Actualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Rejeitar Solicitacao</h3>
                <button onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(''); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Rejeicao *</label>
                  <textarea
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                    rows="4"
                    placeholder="Indique o motivo da rejeicao..."
                  />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-red-700">
                      O utilizador sera notificado sobre a rejeicao e o motivo indicado.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(''); }}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRejectSolicitacao}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all hover:shadow-lg"
                  >
                    Confirmar Rejeicao
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
