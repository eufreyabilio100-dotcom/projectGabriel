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

  const filteredEventos = eventos.filter(e =>
    e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.local.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">A carregar painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 min-h-screen p-4 fixed">
          <div className="mb-8">
            <h2 className="text-white text-xl font-bold">ISPT Admin</h2>
            <p className="text-gray-400 text-sm mt-1">Painel de Administração</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('eventos')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'eventos' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Eventos</span>
            </button>

            <button
              onClick={() => setActiveTab('inscricoes')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'inscricoes' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span>Inscrições</span>
            </button>

            <button
              onClick={() => setActiveTab('utilizadores')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'utilizadores' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Utilizadores</span>
            </button>
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
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
        <main className="ml-64 flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, Admin</h1>
            <p className="text-gray-600">Gerir eventos e utilizadores do ISPT</p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-fadeIn">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-100">Total de Eventos</p>
                      <p className="text-4xl font-bold mt-2">{stats.totalEventos}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl p-6 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-100">Total de Inscrições</p>
                      <p className="text-4xl font-bold mt-2">{stats.totalInscricoes}</p>
                    </div>
                    <div className="bg-white/20 rounded-full p-3">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total de Utilizadores</p>
                      <p className="text-4xl font-bold mt-2">{stats.totalUtilizadores}</p>
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
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos Recentes</h3>
                <div className="space-y-4">
                  {eventos.slice(0, 5).map((evento) => (
                    <div key={evento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{evento.titulo}</p>
                        <p className="text-sm text-gray-500">{evento.local} • {new Date(evento.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Activo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Eventos Tab */}
          {activeTab === 'eventos' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-80"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => { setEditingEvento(null); setFormData({ titulo: '', descricao: '', data: '', hora: '', local: '', capacidade: '' }); setShowModal(true); }}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Criar Evento</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Local</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredEventos.map((evento) => (
                      <tr key={evento.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{evento.titulo}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{evento.descricao}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(evento.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{evento.local}</td>
                        <td className="px-6 py-4">
                          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">{evento.capacidade}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium space-x-3">
                          <button onClick={() => openEditModal(evento)} className="text-blue-600 hover:text-blue-900 transition-colors">Editar</button>
                          <button onClick={() => handleDeleteEvento(evento.id)} className="text-red-600 hover:text-red-900 transition-colors">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inscrições Tab */}
          {activeTab === 'inscricoes' && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-xl shadow overflow-hidden">
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
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(inscricao.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Utilizadores Tab */}
          {activeTab === 'utilizadores' && (
            <div className="animate-fadeIn">
              <div className="bg-white rounded-xl shadow overflow-hidden">
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
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(u.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingEvento ? 'Editar Evento' : 'Criar Novo Evento'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingEvento(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingEvento ? handleUpdateEvento : handleCreateEvento} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Nome do evento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    required
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                    <input
                      type="time"
                      required
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Número de vagas"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingEvento(null); }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all hover:shadow-lg"
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
