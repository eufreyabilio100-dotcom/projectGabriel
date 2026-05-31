import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SkeletonCard } from '../components/Skeleton'
import ScrollReveal from '../components/ScrollReveal'

export default function Eventos() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-asc')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTipo, setFilterTipo] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    fetchEventos()
  }, [])

  const fetchEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*, inscricoes(count)')

      if (error) throw error
      setEventos(data || [])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoLabel = (tipo) => {
    const labels = {
      academico: 'Academico',
      desporto: 'Desporto',
      cultural: 'Cultural',
      workshop: 'Workshop',
      conferencia: 'Conferencia',
      palestra: 'Palestra',
      outro: 'Outro'
    }
    return labels[tipo] || 'Academico'
  }

  const getEventStatus = (evento) => {
    const eventDate = new Date(evento.data)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (eventDate < today) return 'past'
    if (eventDate.toDateString() === today.toDateString()) return 'today'
    return 'upcoming'
  }

  const filteredEventos = eventos
    .filter(evento => {
      const matchesSearch =
        evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evento.local?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'upcoming' && getEventStatus(evento) === 'upcoming') ||
        (filterStatus === 'today' && getEventStatus(evento) === 'today') ||
        (filterStatus === 'past' && getEventStatus(evento) === 'past')

      const matchesTipo =
        filterTipo === 'all' ||
        evento.tipo === filterTipo ||
        (!evento.tipo && filterTipo === 'academico')

      return matchesSearch && matchesStatus && matchesTipo
    })
    .sort((a, b) => {
      if (sortBy === 'date-asc') return new Date(a.data) - new Date(b.data)
      if (sortBy === 'date-desc') return new Date(b.data) - new Date(a.data)
      if (sortBy === 'name') return a.titulo.localeCompare(b.titulo)
      return 0
    })

  const getStatusBadge = (evento) => {
    const status = getEventStatus(evento)
    const badges = {
      past: { text: 'Realizado', color: 'bg-gray-100 text-gray-600' },
      today: { text: 'Hoje', color: 'bg-green-100 text-green-700 animate-pulse' },
      upcoming: { text: 'Próximo', color: 'bg-blue-100 text-blue-700' }
    }
    return badges[status]
  }

  const getCountdown = (evento) => {
    const eventDate = new Date(evento.data + 'T' + evento.hora)
    const now = new Date()
    const diff = eventDate - now

    if (diff <= 0) return null

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h`
    return 'Em breve'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Eventos Académicos</h1>
            <p className="text-lg text-gray-600">
              Descubra os próximos eventos do Instituto Superior Politecnico de Tete
            </p>
          </div>
        </ScrollReveal>

        {/* Filters Bar */}
        <ScrollReveal delay={100}>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Pesquisar por título, descrição ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Todos' },
                  { value: 'upcoming', label: 'Próximos' },
                  { value: 'today', label: 'Hoje' },
                  { value: 'past', label: 'Realizados' }
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filterStatus === filter.value
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Tipo Filter */}
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">Todos os tipos</option>
                <option value="academico">Academico</option>
                <option value="desporto">Desporto</option>
                <option value="cultural">Cultural</option>
                <option value="workshop">Workshop</option>
                <option value="conferencia">Conferencia</option>
                <option value="palestra">Palestra</option>
                <option value="outro">Outro</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="date-asc">Data (mais próximo)</option>
                <option value="date-desc">Data (mais distante)</option>
                <option value="name">Nome (A-Z)</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-500">
          {filteredEventos.length} evento{filteredEventos.length !== 1 ? 's' : ''} encontrado{filteredEventos.length !== 1 ? 's' : ''}
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">Nenhum evento encontrado</p>
            <p className="text-gray-400 text-sm">Tente ajustar os filtros ou pesquisar por outros termos</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEventos.map((evento, index) => {
              const badge = getStatusBadge(evento)
              const countdown = getCountdown(evento)

              return (
                <ScrollReveal key={evento.id} delay={index * 50}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                    <div className="h-48 relative overflow-hidden">
                      {evento.imagem_url ? (
                        <img
                          src={evento.imagem_url}
                          alt={evento.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                          <svg className="w-16 h-16 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm">
                          {getTipoLabel(evento.tipo)}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                      {countdown && (
                        <div className="absolute bottom-3 left-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                          ⏱ {countdown}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-primary-600 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(evento.data).toLocaleDateString('pt-PT')}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {evento.local}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{evento.titulo}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{evento.descricao}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {evento.capacidade} vagas
                          </span>
                          {evento.inscricoes?.[0]?.count > 0 && (
                            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                              {evento.inscricoes[0].count} inscrito{evento.inscricoes[0].count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/eventos/${evento.id}`}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md flex items-center gap-1"
                        >
                          Ver Detalhes
                          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredEventos.map((evento, index) => {
              const badge = getStatusBadge(evento)
              const countdown = getCountdown(evento)

              return (
                <ScrollReveal key={evento.id} delay={index * 30}>
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-4 flex items-center gap-4 group">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {evento.imagem_url ? (
                        <img
                          src={evento.imagem_url}
                          alt={evento.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{evento.titulo}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 flex-shrink-0">
                          {getTipoLabel(evento.tipo)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${badge.color}`}>
                          {badge.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(evento.data).toLocaleDateString('pt-PT')}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {evento.hora}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {evento.local}
                        </span>
                        <span>{evento.capacidade} vagas</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {countdown && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          ⏱ {countdown}
                        </span>
                      )}
                      <Link
                        to={`/eventos/${evento.id}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Ver Detalhes
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
