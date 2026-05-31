import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import Toast from '../components/Toast'
import ScrollReveal from '../components/ScrollReveal'

export default function EventoDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [evento, setEvento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inscrito, setInscrito] = useState(false)
  const [inscricaoLoading, setInscricaoLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [inscricoesCount, setInscricoesCount] = useState(0)

  useEffect(() => {
    fetchEvento()
    if (user) checkInscricao()
  }, [id, user])

  useEffect(() => {
    if (evento) {
      updateCountdown()
      const interval = setInterval(updateCountdown, 1000)
      return () => clearInterval(interval)
    }
  }, [evento])

  const fetchEvento = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*, inscricoes(count)')
        .eq('id', id)
        .single()

      if (error) throw error
      setEvento(data)
      setInscricoesCount(data.inscricoes?.[0]?.count || 0)
    } catch (error) {
      console.error('Erro ao carregar evento:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkInscricao = async () => {
    try {
      const { data } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('evento_id', id)
        .eq('utilizador_id', user.id)
        .single()

      if (data) setInscrito(true)
    } catch (error) {
      // Not inscribed
    }
  }

  const updateCountdown = () => {
    if (!evento) return
    const eventDate = new Date(evento.data + 'T' + evento.hora)
    const now = new Date()
    const diff = eventDate - now

    if (diff <= 0) {
      setCountdown(null)
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    setCountdown({ days, hours, minutes, seconds })
  }

  const handleInscricao = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setInscricaoLoading(true)
    try {
      const { data: inscricao, error } = await supabase
        .from('inscricoes')
        .insert([{
          utilizador_id: user.id,
          evento_id: id,
          status: 'confirmada'
        }])
        .select()
        .single()

      if (error) throw error

      const { error: bilheteError } = await supabase
        .from('bilhetes')
        .insert([{
          inscricao_id: inscricao.id,
          codigo_unico: `ISPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }])

      if (bilheteError) throw bilheteError

      setInscrito(true)
      setInscricoesCount(prev => prev + 1)
      setToast({ message: 'Inscrição realizada com sucesso! Verifique o seu dashboard.', type: 'success' })
    } catch (error) {
      setToast({ message: 'Erro ao inscrever-se: ' + error.message, type: 'error' })
    } finally {
      setInscricaoLoading(false)
    }
  }

  const handleShare = async (platform) => {
    const url = window.location.href
    const text = `Confira o evento "${evento.titulo}" no ISPT Eventos!`

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      copy: null
    }

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url)
        setToast({ message: 'Link copiado para a área de transferência!', type: 'success' })
      } catch {
        setToast({ message: 'Erro ao copiar link', type: 'error' })
      }
    } else {
      window.open(shareUrls[platform], '_blank')
    }
    setShowShareMenu(false)
  }

  const getEventStatus = () => {
    if (!evento) return ''
    const eventDate = new Date(evento.data)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (eventDate < today) return 'past'
    if (eventDate.toDateString() === today.toDateString()) return 'today'
    return 'upcoming'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-gray-500 mb-4">Evento não encontrado</p>
          <Link to="/eventos" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Voltar aos eventos
          </Link>
        </div>
      </div>
    )
  }

  const status = getEventStatus()
  const vagasRestantes = evento.capacidade - inscricoesCount
  const progressPercent = Math.min((inscricoesCount / evento.capacidade) * 100, 100)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600 transition-colors">Início</Link>
            <span>/</span>
            <Link to="/eventos" className="hover:text-primary-600 transition-colors">Eventos</Link>
            <span>/</span>
            <span className="text-gray-900">{evento.titulo}</span>
          </nav>
        </ScrollReveal>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-400 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  {status === 'today' && (
                    <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 animate-pulse">
                      Acontece Hoje!
                    </span>
                  )}
                  {status === 'past' && (
                    <span className="inline-block bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      Evento Realizado
                    </span>
                  )}
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{evento.titulo}</h1>
                </div>

                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="bg-white/20 hover:bg-white/30 p-2.5 rounded-lg transition-colors backdrop-blur-sm"
                    title="Partilhar evento"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl p-2 min-w-[160px] z-50 animate-slideDown">
                      <button onClick={() => handleShare('whatsapp')} className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-green-50 rounded-md text-sm transition-colors">
                        <span className="text-green-600">📱</span> WhatsApp
                      </button>
                      <button onClick={() => handleShare('facebook')} className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md text-sm transition-colors">
                        <span className="text-blue-600">📘</span> Facebook
                      </button>
                      <button onClick={() => handleShare('twitter')} className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-sky-50 rounded-md text-sm transition-colors">
                        <span className="text-sky-500">🐦</span> Twitter
                      </button>
                      <hr className="my-1" />
                      <button onClick={() => handleShare('copy')} className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md text-sm transition-colors">
                        <span>📋</span> Copiar Link
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(evento.data).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{evento.hora}</span>
                </div>
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{evento.local}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown */}
          {countdown && (
            <div className="bg-gray-900 text-white py-4 px-8">
              <div className="flex items-center justify-center gap-6">
                <span className="text-sm text-gray-400 uppercase tracking-wider">Começa em</span>
                <div className="flex gap-4">
                  {[
                    { value: countdown.days, label: 'Dias' },
                    { value: countdown.hours, label: 'Horas' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Seg' }
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="bg-primary-600 text-white text-2xl font-bold w-14 h-14 rounded-lg flex items-center justify-center">
                        {String(item.value).padStart(2, '0')}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8">
            <ScrollReveal>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre o Evento</h2>
                <p className="text-gray-600 leading-relaxed">{evento.descricao}</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ScrollReveal delay={100}>
                <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Capacidade
                  </h3>
                  <p className="text-3xl font-bold text-primary-600">{evento.capacidade}</p>
                  <p className="text-sm text-gray-500">vagas totais</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">{inscricoesCount} inscrito{inscricoesCount !== 1 ? 's' : ''}</span>
                      <span className="text-gray-500">{vagasRestantes} restante{vagasRestantes !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          progressPercent > 80 ? 'bg-red-500' : progressPercent > 50 ? 'bg-yellow-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Data e Hora
                  </h3>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(evento.data).toLocaleDateString('pt-PT', { weekday: 'long' })}
                  </p>
                  <p className="text-gray-600">
                    {new Date(evento.data).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-2xl font-bold text-primary-600 mt-2">{evento.hora}</p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="bg-gray-50 p-5 rounded-xl hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Local
                  </h3>
                  <p className="text-lg font-medium text-gray-900">{evento.local}</p>
                  <p className="text-sm text-gray-500 mt-1">Instituto Superior Politecnico de Tete</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Action Buttons */}
            <ScrollReveal delay={400}>
              <div className="text-center space-y-4">
                {inscrito ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-5 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="font-semibold text-lg">Já está inscrito neste evento!</p>
                    </div>
                    <p className="text-sm mb-4">Verifique o seu dashboard para ver os detalhes da inscrição e o seu bilhete.</p>
                    <Link
                      to="/dashboard"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Ir para o Dashboard
                    </Link>
                  </div>
                ) : status === 'past' ? (
                  <div className="bg-gray-50 border border-gray-200 text-gray-600 px-6 py-5 rounded-xl">
                    <p className="font-semibold">Este evento já foi realizado</p>
                    <p className="text-sm mt-1">Fique atento aos próximos eventos!</p>
                  </div>
                ) : vagasRestantes <= 0 ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-5 rounded-xl">
                    <p className="font-semibold">Esgotado</p>
                    <p className="text-sm mt-1">Não há mais vagas disponíveis para este evento.</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleInscricao}
                      disabled={inscricaoLoading}
                      className="bg-secondary-500 hover:bg-secondary-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    >
                      {inscricaoLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                          A processar...
                        </>
                      ) : (
                        <>
                          Inscrever-se no Evento
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </>
                      )}
                    </button>
                    <p className="text-sm text-gray-500">
                      {vagasRestantes} vaga{vagasRestantes !== 1 ? 's' : ''} restante{vagasRestantes !== 1 ? 's' : ''}
                    </p>
                  </>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* Back button */}
        <ScrollReveal delay={500}>
          <div className="mt-6 text-center">
            <Link
              to="/eventos"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Voltar aos eventos
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
