import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: '',
    local: '',
    capacidade: ''
  })

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

  const fetchData = async () => {
    try {
      const [eventosRes, inscricoesRes, utilizadoresRes] = await Promise.all([
        supabase.from('eventos').select('*').order('created_at', { ascending: false }),
        supabase.from('inscricoes').select('*, utilizadores(nome, email), eventos(titulo)'),
        supabase.from('utilizadores').select('*').order('created_at', { ascending: false })
      ])

      setEventos(eventosRes.data || [])
      setInscricoes(inscricoesRes.data || [])
      setUtilizadores(utilizadoresRes.data || [])
      setStats({
        totalEventos: eventosRes.data?.length || 0,
        totalInscricoes: inscricoesRes.data?.length || 0,
        totalUtilizadores: utilizadoresRes.data?.length || 0
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
    try {
      const { error } = await supabase
        .from('eventos')
        .insert([{
          ...formData,
          capacidade: parseInt(formData.capacidade),
          organizador_id: user.id
        }])

      if (error) throw error

      setShowModal(false)
      setFormData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '' })
      fetchData()
      showToast('Evento criado com sucesso!')
    } catch (error) {
      showToast('Erro ao criar evento: ' + error.message, 'error')
    }
  }

  const handleUpdateEvento = async (e) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('eventos')
        .update({
          ...formData,
          capacidade: parseInt(formData.capacidade)
        })
        .eq('id', editingEvento.id)

      if (error) throw error

      setShowModal(false)
      setEditingEvento(null)
      setFormData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '' })
      fetchData()
      showToast('Evento actualizado com sucesso!')
    } catch (error) {
      showToast('Erro ao actualizar evento: ' + error.message, 'error')
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
      capacidade: evento.capacidade.toString()
    })
    setShowModal(true)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const changeTab = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const filteredEventos = eventos.filter(e =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.local.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
    { id: 'inscricoes', label: 'Inscricoes', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { id: 'utilizadores', label: 'Utilizadores', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">ISPT Admin</h2>
        <button onClick={handleLogout} className="p-2 hover:bg-gray-800 rounded-lg">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-64 bg-gray-900 min-h-screen p-4
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-bold">ISPT Admin</h2>
              <p className="text-gray-400 text-sm mt-1">Painel de Administracao</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-w-0">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Bem-vindo, Admin</h1>
            <p className="text-gray-600 text-sm lg:text-base">Gerir eventos e utilizadores do ISPT</p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fadeIn">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 lg:p-6 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-100 text-sm">Total de Eventos</p>
                      <p className="text-3xl lg:text-4xl font-bold mt-2">{stats.totalEventos}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-2 lg:p-3">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl p-4 lg:p-6 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-100 text-sm">Total de Inscricoes</p>
                      <p className="text-3xl lg:text-4xl font-bold mt-2">{stats.totalInscricoes}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-2 lg:p-3">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 lg:p-6 text-white hover:shadow-lg transition-all hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total de Utilizadores</p>
                      <p className="text-3xl lg:text-4xl font-bold mt-2">{stats.totalUtilizadores}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-2 lg:p-3">
                      <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-xl shadow p-4 lg:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos Recentes</h3>
                <div className="space-y-3">
                  {eventos.slice(0, 5).map((evento) => (
                    <div key={evento.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{evento.titulo}</p>
                        <p className="text-sm text-gray-500 truncate">{evento.local} - {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
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
                    className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => { setEditingEvento(null); setFormData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '' }); setShowModal(true); }}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 lg:px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg flex items-center space-x-2 w-full sm:w-auto justify-center"
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
                            {new Date(evento.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{evento.local}</td>
                          <td className="px-6 py-4">
                            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">{evento.capacidade}</span>
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
                        <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full ml-2">{evento.capacidade} vagas</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{evento.descricao}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                        <span>{new Date(evento.data).toLocaleDateString('pt-BR')}</span>
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
                            {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
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
                      <p className="text-xs text-gray-400 mt-1">{new Date(inscricao.created_at).toLocaleDateString('pt-BR')}</p>
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
                            {new Date(u.created_at).toLocaleDateString('pt-BR')}
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
                      <p className="text-xs text-gray-400 mt-1">{new Date(u.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  ))}
                  {utilizadores.length === 0 && (
                    <p className="text-gray-500 text-center py-8">Nenhum utilizador</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-4 lg:p-6">
              <div className="flex justify-between items-center mb-4 lg:mb-6">
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                  {editingEvento ? 'Editar Evento' : 'Criar Novo Evento'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingEvento(null); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingEvento ? handleUpdateEvento : handleCreateEvento} className="space-y-3 lg:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Nome do evento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                  <textarea
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    rows="3"
                    placeholder="Descreva o evento"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <input
                      type="date"
                      required
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                      type="time"
                      required
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
                    className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Local do evento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
                  <input
                    type="number"
                    required
                    value={formData.capacidade}
                    onChange={(e) => setFormData({...formData, capacidade: e.target.value})}
                    className="w-full px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Numero de vagas"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2 lg:pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingEvento(null); }}
                    className="px-4 lg:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 lg:px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:shadow-lg"
                  >
                    {editingEvento ? 'Actualizar' : 'Criar'}
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
