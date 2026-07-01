'use client'

import { useState, useEffect, useRef } from 'react'
import { useLeads } from '@/hooks/useLeads'
import toast from 'react-hot-toast'

// ============================================================
// GRÁFICO DE DONA
// ============================================================
function LeadChart({ leads }: any) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }

    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    import('chart.js/auto').then((Chart) => {
      const statuses = ['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'client_retained', 'lost']
      const labels = ['Nuevo', 'Contactado', 'Consulta', 'Completado', 'Retenido', 'Perdido']
      const data = statuses.map(s => leads?.filter((l: any) => l.status === s).length || 0)
      const isDark = document.documentElement.classList.contains('dark')

      chartInstance.current = new Chart.default(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#22c55e', '#ef4444'],
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                boxWidth: 12,
                padding: 8,
                color: isDark ? '#e2e8f0' : '#1e293b'
              }
            }
          }
        }
      })
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [leads])

  return (
    <div className="h-[250px] w-full">
      <canvas ref={chartRef} />
    </div>
  )
}

// ============================================================
// GRÁFICO DE INGRESOS
// ============================================================
function RevenueChart() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }

    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    import('chart.js/auto').then((Chart) => {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
      const revenue = [12500, 14800, 13200, 16800, 18200, 22000]
      const isDark = document.documentElement.classList.contains('dark')

      chartInstance.current = new Chart.default(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Ingresos Mensuales',
            data: revenue,
            borderColor: '#c9a84c',
            backgroundColor: 'rgba(201,168,76,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#c9a84c',
            pointBorderColor: '#c9a84c'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: isDark ? '#e2e8f0' : '#1e293b',
                callback: (value: any) => '$' + value.toLocaleString()
              }
            },
            x: {
              ticks: {
                color: isDark ? '#e2e8f0' : '#1e293b'
              }
            }
          }
        }
      })
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
        chartInstance.current = null
      }
    }
  }, [])

  return (
    <div className="h-[250px] w-full">
      <canvas ref={chartRef} />
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Home() {
  const { leads, isLoading, createLead, deleteLead } = useLeads()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isMobile, setIsMobile] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    case_type: 'Asylum',
    status: 'new',
    priority: 'medium'
  })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) setSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'leads', label: 'Leads', icon: '👤' },
    { id: 'kanban', label: 'Pipeline', icon: '📋' },
    { id: 'uscis', label: 'USCIS', icon: '📄' },
    { id: 'eoir', label: 'EOIR', icon: '🏛️' },
    { id: 'bia', label: 'BIA', icon: '📜' },
    { id: 'documentos', label: 'Documentos', icon: '📁' },
    { id: 'tareas', label: 'Tareas', icon: '✅' },
    { id: 'calendario', label: 'Calendario', icon: '📅' },
    { id: 'facturacion', label: 'Facturación', icon: '💰' },
    { id: 'ia', label: 'Asistente IA', icon: '🤖' },
    { id: 'automatizaciones', label: 'Automatizaciones', icon: '⚡' },
    { id: 'usuarios', label: 'Usuarios', icon: '👥' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' },
  ]

  const stats = [
    { title: 'Total Leads', value: leads?.length || 0, icon: '👤', change: '↑ 12% este mes', changeType: 'up' },
    { title: 'Nuevos Leads', value: leads?.filter((l: any) => l.status === 'new').length || 0, icon: '🆕', change: '↑ 8 esta semana', changeType: 'up' },
    { title: 'Casos Activos', value: leads?.filter((l: any) => l.status === 'client_retained').length || 0, icon: '⚖️', change: '↑ 3 nuevos', changeType: 'up' },
    { title: 'Casos Cerrados', value: leads?.filter((l: any) => l.status === 'lost').length || 0, icon: '✅', change: '✓ Tasa 76%', changeType: 'up' },
    { title: 'Tareas Pendientes', value: 0, icon: '📋', change: '⚠️ Requieren atención', changeType: 'warning' },
    { title: 'Usuarios Activos', value: 1, icon: '👥', change: '👥 En línea', changeType: 'up' },
    { title: 'RFEs Pendientes', value: 0, icon: '📬', change: '⚠️ Requieren respuesta', changeType: 'down' },
    { title: 'Ingresos Mensuales', value: '$25,000', icon: '💰', change: '↑ 18% vs mes anterior', changeType: 'up' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createLead({
        ...formData,
        assigned_to: null,
        notes: '',
        tags: []
      })
      setShowModal(false)
      toast.success('✅ Lead creado exitosamente')
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        case_type: 'Asylum',
        status: 'new',
        priority: 'medium'
      })
    } catch (error) {
      toast.error('❌ Error al crear el lead')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚖️</div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Cargando CRM...</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Conectando con la base de datos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'} ${isMobile ? 'transform -translate-x-full' : ''} ${sidebarOpen && isMobile ? 'transform translate-x-0' : ''}`}>
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-gray-800 dark:text-white">Quiroz Law</span>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">Inmigration CRM</p>
              </div>
            )}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>

        <nav className="p-2 overflow-y-auto h-[calc(100vh-180px)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id); if (isMobile) setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${currentView === item.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
              {sidebarOpen && item.id === 'leads' && (
                <span className="ml-auto bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">{leads?.length || 0}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">AQ</div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">Abg. Quiroz</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Fundador / Administrador</p>
              </div>
            )}
            <button onClick={toggleTheme} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              🌙
            </button>
          </div>
        </div>
      </aside>

      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'} ${isMobile ? 'ml-0' : ''}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 md:px-6 py-4 sticky top-0 z-30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  ☰
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  {navItems.find(n => n.id === currentView)?.label || 'Dashboard'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {currentView === 'dashboard' ? 'Panel de control y métricas' : ''}
                </p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition text-sm">
              <span>+</span> Nuevo Lead
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* DASHBOARD */}
          {currentView === 'dashboard' && (
            <div>
              {/* Integrations */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border dark:border-gray-700 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">🔗 Integraciones:</span>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">📅 Conectar Calendar</button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">📁 Conectar Drive</button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">💳 Conectar Stripe</button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">🤖 OpenAI ✅</button>
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                    Sincronizado
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {stats.map((stat) => (
                  <div key={stat.title} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 hover:shadow-lg transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                        {stat.change && (
                          <p className={`text-xs mt-1 ${stat.changeType === 'up' ? 'text-green-600' : stat.changeType === 'down' ? 'text-red-600' : 'text-yellow-600'}`}>
                            {stat.change}
                          </p>
                        )}
                      </div>
                      <span className="text-3xl">{stat.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">📊 Estado de Casos</h3>
                  <LeadChart leads={leads} />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">💰 Ingresos Mensuales</h3>
                  <RevenueChart />
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border dark:border-gray-700">
                <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white">📋 Actividad Reciente</h3>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Últimos 7 días</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acción</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Responsable</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                      {leads && leads.length > 0 ? (
                        leads.slice(0, 5).map((lead: any) => (
                          <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">{lead.first_name} {lead.last_name || ''}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">📝 Lead creado</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{lead.assigned_to || '—'}</td>
                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(lead.created_at).toLocaleDateString('es-ES')}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${lead.status === 'new' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                                {lead.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            🕊️ No hay actividad reciente
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LEADS */}
          {currentView === 'leads' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border dark:border-gray-700">
              <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 dark:text-white">👤 Todos los Leads</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{leads?.length || 0} leads</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Teléfono</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Caso</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {leads && leads.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800 dark:text-white">{lead.first_name} {lead.last_name || ''}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{lead.email || 'Sin email'}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{lead.phone}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">{lead.case_type || 'Sin caso'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${lead.status === 'new' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : lead.status === 'client_retained' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : lead.status === 'lost' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                            {lead.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => deleteLead(lead.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">🗑️</button>
                        </td>
                      </tr>
                    ))}
                    {(!leads || leads.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                          No hay leads registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KANBAN */}
          {currentView === 'kanban' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700">
              <h2 className="font-semibold text-gray-800 dark:text-white mb-4">📋 Pipeline de Leads</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'client_retained', 'lost'].map((status) => {
                  const columnLeads = leads?.filter((l: any) => l.status === status) || []
                  const labels: any = {
                    'new': '🆕 Nuevo',
                    'contacted': '📞 Contactado',
                    'consultation_scheduled': '📅 Consulta',
                    'consultation_completed': '✅ Completado',
                    'client_retained': '⭐ Retenido',
                    'lost': '❌ Perdido'
                  }
                  return (
                    <div key={status} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-h-[200px]">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300">{labels[status]}</h3>
                        <span className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full text-xs">{columnLeads.length}</span>
                      </div>
                      {columnLeads.map((lead: any) => (
                        <div key={lead.id} className="bg-white dark:bg-gray-800 rounded p-3 mb-2 shadow-sm border dark:border-gray-600">
                          <div className="font-medium text-sm text-gray-800 dark:text-white">{lead.first_name} {lead.last_name || ''}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{lead.case_type || 'Sin caso'}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">📞 {lead.phone}</div>
                        </div>
                      ))}
                      {columnLeads.length === 0 && <div className="text-center py-4 text-xs text-gray-400 dark:text-gray-500">Vacío</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* OTRAS VISTAS */}
          {['uscis', 'eoir', 'bia', 'documentos', 'tareas', 'calendario', 'facturacion', 'ia', 'automatizaciones', 'usuarios', 'configuracion'].includes(currentView) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 border dark:border-gray-700 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{navItems.find(n => n.id === currentView)?.label}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Módulo en desarrollo</p>
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">➕ Nuevo Lead</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">×</button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre *</label>
                  <input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} placeholder="Ej: Carlos" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono *</label>
                  <input type="tel" required className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Ej: +57 310 555 1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input type="email" className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Ej: carlos@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Caso</label>
                  <select className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm" value={formData.case_type} onChange={(e) => setFormData({...formData, case_type: e.target.value})}>
                    <option value="Asylum">Asilo</option>
                    <option value="VAWA">VAWA</option>
                    <option value="TPS">TPS</option>
                    <option value="I-130">I-130</option>
                    <option value="I-485">I-485</option>
                    <option value="N-400">N-400</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                  <select className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="new">Nuevo</option>
                    <option value="contacted">Contactado</option>
                    <option value="client_retained">Cliente Retenido</option>
                    <option value="lost">Perdido</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">💾 Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}