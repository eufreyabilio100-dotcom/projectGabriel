import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Toast from '../components/Toast'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [nome, setNome] = useState('')
  const [toast, setToast] = useState(null)
  const [stats, setStats] = useState({ inscricoes: 0, confirmadas: 0, bilhetes: 0 })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProfile()
    fetchStats()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('utilizadores')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setNome(data.nome)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { count: inscricoes } = await supabase
        .from('inscricoes')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', user.id)

      const { count: confirmadas } = await supabase
        .from('inscricoes')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', user.id)
        .eq('status', 'confirmada')

      const { count: bilhetes } = await supabase
        .from('bilhetes')
        .select('*, inscricoes!inner(utilizador_id)', { count: 'exact', head: true })
        .eq('inscricoes.utilizador_id', user.id)

      setStats({ inscricoes: inscricoes || 0, confirmadas: confirmadas || 0, bilhetes: bilhetes || 0 })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSave = async () => {
    if (!nome.trim()) {
      setToast({ message: 'O nome não pode estar vazio', type: 'error' })
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('utilizadores')
        .update({ nome: nome.trim() })
        .eq('id', user.id)

      if (error) throw error

      setProfile({ ...profile, nome: nome.trim() })
      setEditMode(false)
      setToast({ message: 'Perfil actualizado com sucesso!', type: 'success' })
    } catch (error) {
      setToast({ message: 'Erro ao actualizar perfil', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja eliminar a sua conta? Esta acção é irreversível.')) return

    try {
      // Delete user data (cascade will handle related records)
      const { error } = await supabase
        .from('utilizadores')
        .delete()
        .eq('id', user.id)

      if (error) throw error

      await logout()
      navigate('/')
      setToast({ message: 'Conta eliminada com sucesso', type: 'success' })
    } catch (error) {
      setToast({ message: 'Erro ao eliminar conta', type: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Perfil não encontrado</p>
      </div>
    )
  }

  const tipoLabel = profile.tipo === 'admin' ? 'Administrador' : 'Participante'
  const tipoColor = profile.tipo === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
  const memberSince = new Date(profile.created_at).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-t-2xl p-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
              {profile.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profile.nome}</h1>
              <p className="text-primary-200 mt-1">{profile.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${tipoColor}`}>
                {tipoLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 -mt-6 relative z-10 px-4">
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl font-bold text-primary-700">{stats.inscricoes}</div>
            <div className="text-sm text-gray-500 mt-1">Inscrições</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl font-bold text-green-600">{stats.confirmadas}</div>
            <div className="text-sm text-gray-500 mt-1">Confirmadas</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-3xl font-bold text-secondary-600">{stats.bilhetes}</div>
            <div className="text-sm text-gray-500 mt-1">Bilhetes</div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-b-2xl shadow-md mt-6 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Informações Pessoais</h2>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nome</label>
                {editMode ? (
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                ) : (
                  <p className="text-gray-800 font-medium">{profile.nome}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-800 font-medium">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tipo de Conta</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${tipoColor}`}>
                  {tipoLabel}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Membro Desde</label>
                <p className="text-gray-800 font-medium">{memberSince}</p>
              </div>
            </div>

            {editMode && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                >
                  {saving ? 'A guardar...' : 'Guardar Alterações'}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false)
                    setNome(profile.nome)
                  }}
                  className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="p-6 bg-red-50 border-t border-red-100">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Zona de Perigo</h3>
            <p className="text-sm text-red-600 mb-4">Acções irreversíveis. Tenha cuidado.</p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Eliminar Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
