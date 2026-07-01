'use client'

import { useEffect, useRef, useState } from 'react'
import { useLeads } from '@/hooks/useLeads'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ============================================================
// TYPES
// ============================================================
interface Lead {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string
  status: string
  priority: string
  case_type: string | null
  assigned_to: string | null
  notes: string | null
  alien_number: string | null
  receipt_number: string | null
  court: string | null
  judge: string | null
  next_hearing: string | null
  deadline: string | null
  tags: string[]
  created_at: string
  tasks?: Task[]
  activities?: Activity[]
}

interface Task {
  id: string
  text: string
  done: boolean
  assignedTo: string
}

interface Activity {
  id: string
  type: string
  title: string
  description: string
  createdAt: string
  createdBy: string
}

interface USCISCase {
  id: string
  receiptNumber: string
  formType: string
  serviceCenter: string
  status: string
  clientId: string
  filedDate: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface BIAAppeal {
  id: string
  number: string
  clientId: string
  originalCase: string
  status: string
  filedDate: string
  nextDate: string
  notes: string
}

interface Automation {
  id: string
  name: string
  trigger: string
  action: string
  config: any
  status: string
  lastRun: string
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Home() {
  const { leads, isLoading, createLead, updateLead, deleteLead } = useLeads()
  
  // State para UI
  const [currentView, setCurrentView] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  // State para datos adicionales (simulados hasta que los integremos con Supabase)
  const [uscisCases, setUscisCases] = useState<USCISCase[]>([])
  const [biaAppeals, setBiaAppeals] = useState<BIAAppeal[]>([])
  const [automations, setAutomations] = useState<Automation[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  
  // State para el formulario de lead
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    language: 'Español',
    country: '',
    case_type: 'Asylum',
    status: 'new',
    priority: 'medium',
    assigned_to: '',
    alien_number: '',
    receipt_number: '',
    court: '',
    judge: '',
    next_hearing: '',
    deadline: '',
    notes: '',
    tags: [] as string[]
  })

  // Refs para gráficos
  const chartRef = useRef<HTMLCanvasElement>(null)
  const revenueChartRef = useRef<HTMLCanvasElement>(null)

  // ============================================================
  // EFECTOS
  // ============================================================
  
  useEffect(() => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    
    // Cargar datos adicionales simulados
    cargarDatosAdicionales()
  }, [])

  useEffect(() => {
    // Inicializar gráficos cuando se carga el dashboard
    if (currentView === 'dashboard') {
      setTimeout(() => {
        inicializarGraficos()
      }, 300)
    }
  }, [currentView, leads])

  // ============================================================
  // FUNCIONES DE DATOS
  // ============================================================
  
  const cargarDatosAdicionales = () => {
    // Datos simulados para USCIS
    setUscisCases([
      {
        id: '1',
        receiptNumber: 'IOE1234567890',
        formType: 'I-485',
        serviceCenter: 'NBC',
        status: 'biometrics_scheduled',
        clientId: leads?.[0]?.id || '',
        filedDate: '2026-06-01',
        notes: 'Biométricos programados para el 15 de julio',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-15'
      }
    ])
    
    // Datos simulados para BIA
    setBiaAppeals([
      {
        id: '1',
        number: 'BIA-2026-001',
        clientId: leads?.[0]?.id || '',
        originalCase: 'Removal Order',
        status: 'pending',
        filedDate: '2026-05-15',
        nextDate: '2026-08-20',
        notes: 'Apelación presentada contra orden de deportación'
      }
    ])
    
    // Datos simulados para automatizaciones
    setAutomations([
      {
        id: '1',
        name: 'Nuevo Lead → Asignar Tarea',
        trigger: 'lead_created',
        action: 'create_task',
        config: { task_title: 'Contactar lead', assignee: 'Intake Specialist' },
        status: 'active',
        lastRun: '2026-06-28T10:30:00'
      }
    ])
  }

  // ============================================================
  // FUNCIONES DE UI
  // ============================================================
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const cambiarVista = (view: string) => {
    setCurrentView(view)
    setCurrentLeadId(null)
  }

  const verDetalle = (id: string) => {
    setCurrentLeadId(id)
    setCurrentView('leadDetail')
  }

  const cerrarDetalle = () => {
    setCurrentLeadId(null)
    setCurrentView('leads')
  }

  // ============================================================
  // FUNCIONES DE LEADS
  // ============================================================
  
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createLead({
        ...formData,
        tenant_id: 'temp-tenant',
        assigned_to: formData.assigned_to || null,
        notes: formData.notes || '',
        tags: formData.tags || []
      })
      
      setShowLeadModal(false)
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        language: 'Español',
        country: '',
        case_type: 'Asylum',
        status: 'new',
        priority: 'medium',
        assigned_to: '',
        alien_number: '',
        receipt_number: '',
        court: '',
        judge: '',
        next_hearing: '',
        deadline: '',
        notes: '',
        tags: []
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteLead = (id: string) => {
    if (confirm('¿Eliminar este lead permanentemente?')) {
      deleteLead(id)
    }
  }

  // ============================================================
  // FUNCIONES DE GRÁFICOS
  // ============================================================
  
  const inicializarGraficos = () => {
    // Gráfico de estado de casos
    if (chartRef.current && leads) {
      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        // Limpiar canvas
        ctx.clearRect(0, 0, chartRef.current!.width, chartRef.current!.height)
        
        const statusCounts = {
          'Nuevo': leads.filter(l => l.status === 'new').length,
          'Contactado': leads.filter(l => l.status === 'contacted').length,
          'Consulta': leads.filter(l => l.status === 'consultation_scheduled' || l.status === 'consultation_completed').length,
          'Retainer': leads.filter(l => l.status === 'retainer_sent' || l.status === 'retainer_signed').length,
          'Cliente': leads.filter(l => l.status === 'client_retained').length,
          'Perdido': leads.filter(l => l.status === 'lost').length
        }
        
        const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#22c55e', '#ef4444']
        const total = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1
        let startAngle = -Math.PI / 2
        
        const centerX = chartRef.current!.width / 2
        const centerY = chartRef.current!.height / 2
        const radius = Math.min(centerX, centerY) - 20
        
        Object.entries(statusCounts).forEach(([label, count], index) => {
          const sliceAngle = (count / total) * 2 * Math.PI
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
          ctx.closePath()
          ctx.fillStyle = colors[index % colors.length]
          ctx.fill()
          startAngle += sliceAngle
        })
        
        // Leyenda
        let legendY = 20
        Object.entries(statusCounts).forEach(([label, count], index) => {
          ctx.fillStyle = colors[index % colors.length]
          ctx.fillRect(10, legendY, 12, 12)
          ctx.fillStyle = '#666'
          ctx.font = '11px sans-serif'
          ctx.fillText(`${label}: ${count}`, 28, legendY + 10)
          legendY += 20
        })
      }
    }
    
    // Gráfico de ingresos
    if (revenueChartRef.current) {
      const ctx = revenueChartRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, revenueChartRef.current!.width, revenueChartRef.current!.height)
        
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
        const revenue = [12500, 14800, 13200, 16800, 18200, 22000]
        const maxRevenue = Math.max(...revenue)
        
        const padding = 40
        const chartWidth = revenueChartRef.current!.width - padding * 2
        const chartHeight = revenueChartRef.current!.height - padding * 2
        
        // Dibujar líneas
        ctx.beginPath()
        ctx.strokeStyle = '#c9a84c'
        ctx.lineWidth = 2
        
        revenue.forEach((value, index) => {
          const x = padding + (index / (revenue.length - 1)) * chartWidth
          const y = padding + chartHeight - (value / maxRevenue) * chartHeight
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
        
        // Dibujar puntos
        revenue.forEach((value, index) => {
          const x = padding + (index / (revenue.length - 1)) * chartWidth
          const y = padding + chartHeight - (value / maxRevenue) * chartHeight
          
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, 2 * Math.PI)
          ctx.fillStyle = '#c9a84c'
          ctx.fill()
          
          // Etiquetas
          ctx.fillStyle = '#666'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(months[index], x, padding + chartHeight + 15)
          ctx.fillText('$' + (value / 1000).toFixed(1) + 'k', x, y - 10)
        })
      }
    }
  }

  // ============================================================
  // FUNCIONES DE IA Y AUTOMATIZACIONES (simuladas)
  // ============================================================
  
  const generarDocumentoIA = () => {
    toast.success('🤖 Generando documento con IA...')
    setTimeout(() => {
      toast.success('✅ Documento generado exitosamente')
    }, 2000)
  }

  const enviarPreguntaIA = () => {
    const input = document.getElementById('aiChatInput') as HTMLInputElement
    if (!input) return
    
    const question = input.value.trim()
    if (!question) return
    
    toast.info('🤖 Procesando pregunta...')
    setTimeout(() => {
      toast.success('✅ Respuesta generada')
      input.value = ''
    }, 1500)
  }

  // ============================================================
  // FUNCIONES DE INTEGRACIONES
  // ============================================================
  
  const conectarGoogleCalendar = () => {
    toast.success('✅ Google Calendar conectado')
  }

  const conectarGoogleDrive = () => {
    toast.success('✅ Google Drive conectado')
  }

  const conectarStripe = () => {
    toast.success('✅ Stripe conectado')
  }

  // ============================================================
  // RENDER
  // ============================================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">⚖️</div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Cargando CRM...</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Conectando con la base de datos</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER: SIDEBAR
  // ============================================================
  
  const renderSidebar = () => (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>◀</button>

      <div className="sidebar-brand">
        <div className="logo-wrapper">
          <div className="logo-ring"></div>
          <div className="logo-icon">
            <span className="scales">⚖️</span>QL
          </div>
        </div>
        <div>
          <div className="logo-text">Quiroz <span>Law</span></div>
          <div className="logo-sub">Inmigration CRM</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Principal</div>
        <a className={currentView === 'dashboard' ? 'active' : ''} onClick={() => cambiarVista('dashboard')}>
          <span className="icon">📊</span> <span>Dashboard</span>
        </a>
        <a className={currentView === 'kanban' ? 'active' : ''} onClick={() => cambiarVista('kanban')}>
          <span className="icon">📋</span> <span>Pipeline</span>
          <span className="badge">{leads?.length || 0}</span>
        </a>
        <a className={currentView === 'leads' || currentView === 'leadDetail' ? 'active' : ''} onClick={() => cambiarVista('leads')}>
          <span className="icon">👤</span> <span>Leads</span>
          <span className="badge">{leads?.length || 0}</span>
        </a>
        <a className={currentView === 'clientes' ? 'active' : ''} onClick={() => cambiarVista('clientes')}>
          <span className="icon">👥</span> <span>Clientes</span>
          <span className="badge">{leads?.filter(l => l.status === 'client_retained').length || 0}</span>
        </a>
        <a className={currentView === 'casos' ? 'active' : ''} onClick={() => cambiarVista('casos')}>
          <span className="icon">⚖️</span> <span>Casos</span>
          <span className="badge">{leads?.filter(l => l.status === 'client_retained' || l.status === 'consultation_completed').length || 0}</span>
        </a>

        <div className="nav-section">Migratorio</div>
        <a className={currentView === 'eoir' ? 'active' : ''} onClick={() => cambiarVista('eoir')}>
          <span className="icon">🏛️</span> <span>EOIR</span>
        </a>
        <a className={currentView === 'uscis' ? 'active' : ''} onClick={() => cambiarVista('uscis')}>
          <span className="icon">📄</span> <span>USCIS</span>
          <span className="badge">{uscisCases.length}</span>
        </a>
        <a className={currentView === 'bia' ? 'active' : ''} onClick={() => cambiarVista('bia')}>
          <span className="icon">📜</span> <span>BIA</span>
        </a>

        <div className="nav-section">Gestión</div>
        <a className={currentView === 'documentos' ? 'active' : ''} onClick={() => cambiarVista('documentos')}>
          <span className="icon">📁</span> <span>Documentos</span>
        </a>
        <a className={currentView === 'tareas' ? 'active' : ''} onClick={() => cambiarVista('tareas')}>
          <span className="icon">✅</span> <span>Tareas</span>
          <span className="badge">0</span>
        </a>
        <a className={currentView === 'calendario' ? 'active' : ''} onClick={() => cambiarVista('calendario')}>
          <span className="icon">📅</span> <span>Calendario</span>
        </a>
        <a className={currentView === 'facturacion' ? 'active' : ''} onClick={() => cambiarVista('facturacion')}>
          <span className="icon">💰</span> <span>Facturación</span>
        </a>

        <div className="nav-section">IA & Automatización</div>
        <a className={currentView === 'ia' ? 'active' : ''} onClick={() => cambiarVista('ia')}>
          <span className="icon">🤖</span> <span>Asistente IA</span>
        </a>
        <a className={currentView === 'automatizaciones' ? 'active' : ''} onClick={() => cambiarVista('automatizaciones')}>
          <span className="icon">⚡</span> <span>Automatizaciones</span>
          <span className="badge">{automations.filter(a => a.status === 'active').length}</span>
        </a>

        <div className="nav-section">Equipo</div>
        <a className={currentView === 'usuarios' ? 'active' : ''} onClick={() => cambiarVista('usuarios')}>
          <span className="icon">👥</span> <span>Usuarios</span>
          <span className="badge">1</span>
        </a>
        <a className={currentView === 'configuracion' ? 'active' : ''} onClick={() => cambiarVista('configuracion')}>
          <span className="icon">⚙️</span> <span>Configuración</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">AQ</div>
        <div className="user-info">
          <strong>Abg. Quiroz</strong>
          <small>Fundador / Administrador</small>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </aside>
  )

  // ============================================================
  // RENDER: DASHBOARD
  // ============================================================
  
  const renderDashboard = () => (
    <div className="view-content active">
      {/* Integration Bar */}
      <div className="integration-bar">
        <span style={{fontWeight:600,fontSize:13}}>🔗 Integraciones:</span>
        <button className="btn-google" onClick={conectarGoogleCalendar}>
          <svg className="g-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22 7.5v13.5c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V7.5h20z"/><path fill="#34A853" d="M22 7.5H2v2h20v-2z"/><path fill="#FBBC05" d="M8.5 10.5h-3v-3h3v3zm0 4h-3v-3h3v3zm0 4h-3v-3h3v3z"/><path fill="#EA4335" d="M15.5 10.5h-3v-3h3v3zm0 4h-3v-3h3v3zm0 4h-3v-3h3v3z"/></svg>
          <span>Conectar Calendar</span>
        </button>
        <button className="btn-google" onClick={conectarGoogleDrive}>
          <svg className="g-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M4.5 20.5L6 18h12l1.5 2.5H4.5z"/><path fill="#EA4335" d="M9 6.5l3-5 3 5H9z"/><path fill="#FBBC05" d="M6 18l3-5h6l3 5H6z"/><path fill="#34A853" d="M12 1.5L9 6.5h6l-3-5z"/></svg>
          <span>Conectar Drive</span>
        </button>
        <button className="btn-google" onClick={conectarStripe}>
          <svg className="g-icon" viewBox="0 0 24 24" width="20" height="20"><path fill="#635BFF" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#635BFF" d="M12 7v2.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5h2c0 2.48-2.02 4.5-4.5 4.5S7.5 13.98 7.5 11.5 9.52 7 12 7z"/></svg>
          <span>Conectar Stripe</span>
        </button>
        <span style={{fontSize:11,color:'var(--text-light)',marginLeft:'auto'}}>
          🟢 Sincronizado
        </span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{leads?.length || 0}</div>
          <div className="stat-label">Total Leads</div>
          <div className="stat-change up">↑ 12% este mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{leads?.filter(l => l.status === 'new').length || 0}</div>
          <div className="stat-label">Nuevos Leads</div>
          <div className="stat-change up">↑ 8 esta semana</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{leads?.filter(l => l.status === 'client_retained' || l.status === 'consultation_completed').length || 0}</div>
          <div className="stat-label">Casos Activos</div>
          <div className="stat-change up">↑ 3 nuevos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{leads?.filter(l => l.status === 'lost').length || 0}</div>
          <div className="stat-label">Casos Cerrados</div>
          <div className="stat-change up">✓ Tasa 76%</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">0</div>
          <div className="stat-label">Tareas Pendientes</div>
          <div className="stat-change warning">⚠️ Requieren atención</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">1</div>
          <div className="stat-label">Usuarios Activos</div>
          <div className="stat-change up">👥 En línea</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{uscisCases.filter(u => u.status === 'rfe_sent').length || 0}</div>
          <div className="stat-label">RFEs Pendientes</div>
          <div className="stat-change down">⚠️ Requieren respuesta</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">$0</div>
          <div className="stat-label">Ingresos Mensuales</div>
          <div className="stat-change up">↑ 18% vs mes anterior</div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
        <div className="table-container" style={{padding:16}}>
          <h4 style={{marginBottom:12}}>📊 Estado de Casos</h4>
          <canvas ref={chartRef} height={200} width={300}></canvas>
        </div>
        <div className="table-container" style={{padding:16}}>
          <h4 style={{marginBottom:12}}>💰 Ingresos Mensuales</h4>
          <canvas ref={revenueChartRef} height={200} width={300}></canvas>
        </div>
      </div>

      {/* Tabla de actividad reciente */}
      <div className="table-container">
        <div className="table-toolbar">
          <strong>📋 Actividad Reciente</strong>
          <span style={{fontSize:12,color:'var(--text-light)',marginLeft:'auto'}}>Últimos 7 días</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Acción</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {leads && leads.length > 0 ? (
                leads.slice(0, 5).map(lead => (
                  <tr key={lead.id}>
                    <td><strong>{lead.first_name} {lead.last_name || ''}</strong></td>
                    <td>📝 Lead creado</td>
                    <td>{lead.assigned_to || '—'}</td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge ${lead.status === 'new' ? 'badge-nuevo' : ''}`}>{lead.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center text-muted" style={{padding:30}}>🕊️ No hay actividad reciente</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // RENDER: LEADS
  // ============================================================
  
  const renderLeadsList = () => (
    <div className="view-content active">
      <div className="table-container">
        <div className="table-toolbar">
          <input type="text" placeholder="🔍 Buscar por nombre, caso, teléfono..." style={{flex:1,minWidth:160,padding:'6px 12px',border:'1px solid var(--border)',borderRadius:8,background:'var(--card-bg)',color:'var(--text)'}} />
          <select style={{padding:'6px 12px',border:'1px solid var(--border)',borderRadius:8,background:'var(--card-bg)',color:'var(--text)'}}>
            <option value="todos">Todos los estados</option>
            <option value="new">Nuevo</option>
            <option value="contacted">Contactado</option>
            <option value="consultation_scheduled">Consulta Programada</option>
            <option value="consultation_completed">Consulta Completada</option>
            <option value="retainer_sent">Retainer Enviado</option>
            <option value="retainer_signed">Retainer Firmado</option>
            <option value="client_retained">Cliente Retenido</option>
            <option value="lost">Perdido</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setShowLeadModal(true)}>+ Nuevo Lead</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Caso</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Responsable</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {leads && leads.length > 0 ? (
                leads.map(lead => (
                  <tr key={lead.id}>
                    <td><strong>{lead.first_name} {lead.last_name || ''}</strong></td>
                    <td>{lead.phone}</td>
                    <td><span className="badge badge-nuevo">{lead.case_type || '—'}</span></td>
                    <td><span className={`badge ${lead.status === 'new' ? 'badge-nuevo' : lead.status === 'contacted' ? 'badge-contactado' : lead.status === 'client_retained' ? 'badge-contratado' : lead.status === 'lost' ? 'badge-perdido' : ''}`}>{lead.status}</span></td>
                    <td><span className={`badge-prioridad ${lead.priority === 'high' ? 'badge-prioridad-alta' : lead.priority === 'medium' ? 'badge-prioridad-media' : 'badge-prioridad-baja'}`}>{lead.priority}</span></td>
                    <td>{lead.assigned_to || '—'}</td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                        <button className="btn btn-primary btn-xs" onClick={() => verDetalle(lead.id)}>👁️</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDeleteLead(lead.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="text-center text-muted" style={{padding:40}}>🕊️ No hay leads registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // RENDER: KANBAN
  // ============================================================
  
  const renderKanban = () => {
    const statuses = ['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'retainer_sent', 'retainer_signed', 'client_retained', 'lost']
    const labels = ['Nuevo', 'Contactado', 'Consulta Programada', 'Consulta Completada', 'Retainer Enviado', 'Retainer Firmado', 'Cliente Retenido', 'Perdido']
    
    return (
      <div className="view-content active">
        <div className="kanban-board">
          {statuses.map((status, i) => {
            const columnLeads = leads?.filter(l => l.status === status) || []
            return (
              <div className="kanban-column" key={status}>
                <div className="column-header">
                  {labels[i]}
                  <span className="count">{columnLeads.length}</span>
                </div>
                {columnLeads.map(lead => (
                  <div className="kanban-card" key={lead.id} onClick={() => verDetalle(lead.id)}>
                    <div className="card-title">{lead.first_name} {lead.last_name || ''}</div>
                    <div className="card-sub">{lead.case_type || 'Sin caso'}</div>
                    <div className="card-footer">
                      <span className={`badge-prioridad ${lead.priority === 'high' ? 'badge-prioridad-alta' : lead.priority === 'medium' ? 'badge-prioridad-media' : 'badge-prioridad-baja'}`}>{lead.priority}</span>
                      <span className="assignee">{lead.assigned_to || '—'}</span>
                    </div>
                  </div>
                ))}
                {columnLeads.length === 0 && (
                  <div style={{textAlign:'center',padding:20,color:'var(--text-light)',fontSize:12}}>Vacío</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER: USCIS
  // ============================================================
  
  const renderUSCIS = () => (
    <div className="view-content active">
      <div className="integration-bar">
        <span style={{fontWeight:600,fontSize:13}}>📄 Seguimiento USCIS</span>
        <button className="btn btn-primary btn-sm">+ Agregar Caso</button>
        <button className="btn btn-secondary btn-sm">🔄 Actualizar Estados</button>
      </div>
      
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(4, 1fr)'}}>
        <div className="stat-card"><div className="stat-number">{uscisCases.length}</div><div className="stat-label">Total Casos</div></div>
        <div className="stat-card"><div className="stat-number">{uscisCases.filter(u => u.status !== 'approved' && u.status !== 'denied').length}</div><div className="stat-label">Pendientes</div></div>
        <div className="stat-card"><div className="stat-number">{uscisCases.filter(u => u.status === 'approved').length}</div><div className="stat-label">Aprobados</div></div>
        <div className="stat-card"><div className="stat-number">{uscisCases.filter(u => u.status === 'rfe_sent').length}</div><div className="stat-label">RFEs Pendientes</div></div>
      </div>
      
      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Formulario</th>
                <th>Service Center</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {uscisCases.length > 0 ? (
                uscisCases.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.receiptNumber}</strong></td>
                    <td>{u.formType}</td>
                    <td>{u.serviceCenter}</td>
                    <td><span className="badge badge-consulta">{u.status}</span></td>
                    <td><button className="btn btn-secondary btn-xs">🔄</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center text-muted" style={{padding:40}}>📄 No hay casos USCIS</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // RENDER: ASISTENTE IA
  // ============================================================
  
  const renderIA = () => (
    <div className="view-content active">
      <div className="integration-bar">
        <span style={{fontWeight:600,fontSize:13}}>🤖 Asistente Legal con IA</span>
        <span style={{fontSize:11,color:'var(--text-light)'}}>OpenAI: Conectado ✅</span>
      </div>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div className="table-container" style={{padding:16}}>
          <h4>📄 Generar Documento</h4>
          <div style={{marginTop:12}}>
            <select style={{width:'100%',padding:8,border:'1px solid var(--border)',borderRadius:8,marginBottom:8,background:'var(--card-bg)',color:'var(--text)'}}>
              <option value="">Seleccionar tipo...</option>
              <option value="declaration">Declaración Personal</option>
              <option value="chronology">Cronología</option>
              <option value="cover_letter">Carta de Presentación</option>
              <option value="rfe_response">Respuesta a RFE</option>
            </select>
            <button className="btn btn-primary" style={{width:'100%'}} onClick={generarDocumentoIA}>🤖 Generar Documento</button>
          </div>
        </div>
        
        <div className="table-container" style={{padding:16}}>
          <h4>📋 Generar Formulario</h4>
          <div style={{marginTop:12}}>
            <select style={{width:'100%',padding:8,border:'1px solid var(--border)',borderRadius:8,marginBottom:8,background:'var(--card-bg)',color:'var(--text)'}}>
              <option value="">Seleccionar formulario...</option>
              <option value="I-130">I-130</option>
              <option value="I-485">I-485</option>
              <option value="I-589">I-589 (Asilo)</option>
              <option value="N-400">N-400</option>
            </select>
            <button className="btn btn-primary" style={{width:'100%'}} onClick={() => toast.success('📄 Formulario generado')}>📄 Generar Formulario</button>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <div style={{padding:16}}>
          <h4 style={{marginBottom:8}}>💬 Consultar al Asistente IA</h4>
          <p style={{fontSize:12,color:'var(--text-light)',marginBottom:12}}>Haz preguntas sobre el caso, evidencia, plazos o jurisprudencia</p>
        </div>
        <div className="ai-chat-container">
          <div className="ai-chat-messages" id="aiChatMessages" style={{height:200,overflowY:'auto',padding:16,background:'var(--bg)'}}>
            <div className="ai-chat-message assistant" style={{marginBottom:12,padding:'10px 14px',borderRadius:'var(--radius)',maxWidth:'80%',background:'var(--card-bg)',border:'1px solid var(--border)'}}>
              👋 Hola, soy el asistente legal de Quiroz Law. ¿En qué puedo ayudarte?
            </div>
          </div>
          <div className="ai-chat-input" style={{display:'flex',gap:8,padding:12,borderTop:'1px solid var(--border)',background:'var(--card-bg)'}}>
            <input id="aiChatInput" type="text" placeholder="Escribe tu pregunta..." style={{flex:1,padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,background:'var(--bg)',color:'var(--text)'}} onKeyDown={(e) => e.key === 'Enter' && enviarPreguntaIA()} />
            <button onClick={enviarPreguntaIA} style={{padding:'8px 20px',background:'var(--gold-gradient)',color:'var(--primary)',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // RENDER: AUTOMATIZACIONES
  // ============================================================
  
  const renderAutomations = () => (
    <div className="view-content active">
      <div className="integration-bar">
        <span style={{fontWeight:600,fontSize:13}}>⚡ Automatizaciones</span>
        <button className="btn btn-primary btn-sm">+ Nueva Automatización</button>
      </div>
      
      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Trigger</th>
                <th>Acción</th>
                <th>Estado</th>
                <th>Última Ejecución</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {automations.length > 0 ? (
                automations.map(a => (
                  <tr key={a.id}>
                    <td><strong>{a.name}</strong></td>
                    <td>{a.trigger}</td>
                    <td>{a.action}</td>
                    <td><span className={`badge ${a.status === 'active' ? 'badge-contratado' : 'badge-cerrado'}`}>{a.status}</span></td>
                    <td>{a.lastRun ? new Date(a.lastRun).toLocaleDateString() : 'Nunca'}</td>
                    <td><button className="btn btn-secondary btn-xs">⏸️</button></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="text-center text-muted" style={{padding:40}}>⚡ No hay automatizaciones</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // ============================================================
  // RENDER: OTRAS VISTAS (simplificadas)
  // ============================================================
  
  const renderEmptyView = (title: string, emoji: string, description: string) => (
    <div className="view-content active">
      <div className="empty-state">
        <span className="emoji">{emoji}</span>
        <h3>{title}</h3>
        <p>{description}</p>
        <p className="text-muted" style={{fontSize:13,marginTop:6}}>Próximamente disponible</p>
      </div>
    </div>
  )

  // ============================================================
  // RENDER: DETALLE DE LEAD
  // ============================================================
  
  const renderLeadDetail = () => {
    const lead = leads?.find(l => l.id === currentLeadId)
    if (!lead) return renderLeadsList()
    
    return (
      <div className="view-content active">
        <div className="detail-panel open">
          <div className="detail-header">
            <div>
              <h3>{lead.first_name} {lead.last_name || ''}</h3>
              <span className="text-muted">{lead.case_type || 'Sin caso'} · {lead.status}</span>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <button className="btn btn-secondary btn-sm" onClick={cerrarDetalle}>✕ Cerrar</button>
              <button className="btn btn-primary btn-sm" onClick={() => toast.info('✎ Editando lead...')}>✎ Editar</button>
              <button className="btn btn-success btn-sm" onClick={generarDocumentoIA}>🤖 Generar Documento</button>
            </div>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item"><label>Teléfono</label><div className="value">{lead.phone}</div></div>
            <div className="detail-item"><label>Email</label><div className="value">{lead.email || '—'}</div></div>
            <div className="detail-item"><label>Tipo de Caso</label><div className="value">{lead.case_type || '—'}</div></div>
            <div className="detail-item"><label>Estado</label><div className="value"><span className={`badge ${lead.status === 'new' ? 'badge-nuevo' : ''}`}>{lead.status}</span></div></div>
            <div className="detail-item"><label>Responsable</label><div className="value">{lead.assigned_to || '—'}</div></div>
            <div className="detail-item"><label>Prioridad</label><div className="value"><span className={`badge-prioridad ${lead.priority === 'high' ? 'badge-prioridad-alta' : lead.priority === 'medium' ? 'badge-prioridad-media' : 'badge-prioridad-baja'}`}>{lead.priority}</span></div></div>
            <div className="detail-item" style={{gridColumn:'1/-1'}}><label>Notas</label><div className="value" style={{fontWeight:400,color:'var(--text-light)'}}>{lead.notes || 'Sin notas'}</div></div>
          </div>
          
          <div style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:14}}>
            <div className="flex-between">
              <strong>📋 Tareas</strong>
              <span className="text-muted" style={{fontSize:12}}>0 tareas</span>
            </div>
            <div className="task-list">
              <div className="text-muted" style={{padding:10,textAlign:'center',fontSize:13}}>No hay tareas</div>
            </div>
            <div className="task-add">
              <input type="text" placeholder="Nueva tarea..." style={{flex:1,minWidth:120,padding:'7px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,background:'var(--card-bg)',color:'var(--text)'}} />
              <button style={{padding:'7px 16px',background:'var(--gold-gradient)',color:'var(--primary)',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>+ Agregar</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER: MODAL DE CREACIÓN
  // ============================================================
  
  const renderModal = () => {
    if (!showLeadModal) return null
    
    return (
      <div className="modal-overlay open" onClick={(e) => {
        if (e.target === e.currentTarget) setShowLeadModal(false)
      }}>
        <div className="modal">
          <h2>➕ Nuevo Lead</h2>
          <p className="modal-sub">Registra un potencial cliente para Quiroz Law Firm</p>
          <form onSubmit={handleCreateLead}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre <span className="required">*</span></label>
                <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Teléfono <span className="required">*</span></label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Caso <span className="required">*</span></label>
                <select required value={formData.case_type} onChange={(e) => setFormData({...formData, case_type: e.target.value})}>
                  <option value="Asylum">Asilo</option>
                  <option value="VAWA">VAWA</option>
                  <option value="SIJS">SIJS</option>
                  <option value="TPS">TPS</option>
                  <option value="I-130">I-130</option>
                  <option value="I-485">I-485</option>
                  <option value="N-400">N-400</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="new">Nuevo</option>
                  <option value="contacted">Contactado</option>
                  <option value="consultation_scheduled">Consulta Programada</option>
                  <option value="consultation_completed">Consulta Completada</option>
                  <option value="retainer_sent">Retainer Enviado</option>
                  <option value="retainer_signed">Retainer Firmado</option>
                  <option value="client_retained">Cliente Retenido</option>
                  <option value="lost">Perdido</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prioridad</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <div className="form-group">
                <label>Responsable</label>
                <select value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}>
                  <option value="">Seleccionar...</option>
                  <option value="Abg. Quiroz">Abg. Quiroz</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Notas</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="Detalles del caso..." />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowLeadModal(false)}>Cancelar</button>
              <button type="submit" className="btn-save">💾 Guardar</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  
  return (
    <div className="app-container" style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      {/* Inject styles */}
      <style>{`
        :root {
          --primary: #0a1628;
          --primary-light: #14263e;
          --primary-dark: #060e1a;
          --gold: #c9a84c;
          --gold-light: #e8d5a3;
          --gold-dark: #a8892e;
          --gold-gradient: linear-gradient(135deg, #c9a84c, #a8892e);
          --bg: #f0f4f9;
          --bg-dark: #0f1724;
          --card-bg: #ffffff;
          --card-bg-dark: #1a2332;
          --text: #1a2332;
          --text-dark: #e8edf5;
          --text-light: #5a6a7e;
          --text-light-dark: #8a9ab0;
          --border: #e2e8f0;
          --border-dark: #2a3a4e;
          --shadow: 0 4px 24px rgba(0,0,0,0.06);
          --shadow-lg: 0 12px 48px rgba(0,0,0,0.12);
          --radius: 12px;
          --radius-lg: 16px;
          --transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          --sidebar-width: 280px;
          --sidebar-collapsed: 72px;
        }

        [data-theme="dark"] {
          --bg: var(--bg-dark);
          --card-bg: var(--card-bg-dark);
          --text: var(--text-dark);
          --text-light: var(--text-light-dark);
          --border: var(--border-dark);
          --shadow: var(--shadow-dark);
        }

        body { background: var(--bg); color: var(--text); }

        .sidebar {
          width: var(--sidebar-width);
          background: var(--primary);
          color: #fff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
          box-shadow: 4px 0 30px rgba(0,0,0,0.2);
          z-index: 100;
          transition: width 0.3s ease;
          position: relative;
        }
        .sidebar.collapsed { width: var(--sidebar-collapsed); }
        .sidebar.collapsed .sidebar-brand .logo-text,
        .sidebar.collapsed .sidebar-brand .logo-sub,
        .sidebar.collapsed .sidebar-nav a span:not(.icon),
        .sidebar.collapsed .sidebar-nav .nav-section,
        .sidebar.collapsed .sidebar-footer .user-info,
        .sidebar.collapsed .sidebar-nav a .badge {
          display: none;
        }
        .sidebar.collapsed .sidebar-brand { padding: 16px 10px; justify-content: center; }
        .sidebar.collapsed .sidebar-nav a { padding: 12px; justify-content: center; }
        .sidebar.collapsed .sidebar-footer { justify-content: center; padding: 12px; }

        .sidebar-toggle {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          background: var(--gold);
          border: none;
          border-radius: 50%;
          color: var(--primary);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 10;
          transition: var(--transition);
        }
        .sidebar.collapsed .sidebar-toggle { transform: translateY(-50%) rotate(180deg); }

        .sidebar-brand {
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }
        .sidebar-brand .logo-wrapper {
          position: relative;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
        }
        .sidebar-brand .logo-ring {
          position: absolute;
          inset: -3px;
          border: 2px solid transparent;
          border-top-color: var(--gold);
          border-right-color: var(--gold);
          border-radius: 50%;
          animation: spin 8s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .sidebar-brand .logo-icon {
          width: 52px;
          height: 52px;
          background: var(--gold-gradient);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          color: var(--primary);
          box-shadow: 0 4px 16px rgba(201,168,76,0.35);
          position: relative;
          z-index: 1;
        }
        .sidebar-brand .logo-text { font-size: 20px; font-weight: 700; }
        .sidebar-brand .logo-text span { color: var(--gold); }
        .sidebar-brand .logo-sub { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 2.5px; text-transform: uppercase; }

        .sidebar-nav { flex: 1; padding: 12px; overflow-y: auto; }
        .sidebar-nav .nav-section {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.25);
          padding: 16px 12px 6px;
          font-weight: 700;
        }
        .sidebar-nav a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 14px;
          border-radius: 8px;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          font-size: 13.5px;
          transition: var(--transition);
          cursor: pointer;
          margin-bottom: 1px;
          position: relative;
        }
        .sidebar-nav a:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .sidebar-nav a.active { background: rgba(201,168,76,0.15); color: var(--gold); }
        .sidebar-nav a.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 3px;
          background: var(--gold);
          border-radius: 0 4px 4px 0;
        }
        .sidebar-nav a .icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }
        .sidebar-nav a .badge {
          margin-left: auto;
          background: rgba(201,168,76,0.2);
          color: var(--gold);
          font-size: 10px;
          padding: 1px 10px;
          border-radius: 20px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 14px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .sidebar-footer .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gold-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--primary);
          font-size: 13px;
          flex-shrink: 0;
        }

        .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .header {
          background: var(--card-bg);
          padding: 12px 28px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
          flex-wrap: wrap;
          gap: 10px;
          min-height: 64px;
        }
        .header-left .page-title { font-size: 20px; font-weight: 600; }
        .header-left .page-title small { font-weight: 400; font-size: 13px; color: var(--text-light); margin-left: 8px; }
        .header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

        .content { flex: 1; overflow-y: auto; padding: 20px 28px; }

        .btn-primary {
          background: var(--gold-gradient);
          color: var(--primary);
          border: none;
          padding: 7px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(201,168,76,0.35); }
        .btn-secondary {
          background: var(--bg);
          color: var(--text);
          border: none;
          padding: 7px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: var(--transition);
        }
        .btn-secondary:hover { background: #dce3ec; }
        .btn-sm { padding: 3px 12px; font-size: 11px; border-radius: 6px; }
        .btn-xs { padding: 2px 8px; font-size: 10px; border-radius: 4px; }
        .btn-danger { background: #fee2e2; color: #991b1b; border: none; padding: 3px 12px; border-radius: 6px; cursor: pointer; }
        .btn-danger:hover { background: #fecaca; }
        .btn-success { background: #d1fae5; color: #065f46; border: none; padding: 3px 12px; border-radius: 6px; cursor: pointer; }

        .btn-google {
          background: #fff;
          color: #1a2332;
          border: 1px solid #dadce0;
          padding: 6px 16px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          transition: var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-google:hover { background: #f8f9fa; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .btn-google.connected { border-color: #34a853; background: #e6f4ea; }

        .view-content { display: none; animation: fadeIn 0.3s ease; }
        .view-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: var(--card-bg);
          padding: 16px 20px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          transition: var(--transition);
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
        .stat-card .stat-number { font-size: 26px; font-weight: 700; }
        .stat-card .stat-label { font-size: 12px; color: var(--text-light); margin-top: 2px; }
        .stat-card .stat-change { font-size: 11px; font-weight: 600; margin-top: 4px; }
        .stat-card .stat-change.up { color: #16a34a; }
        .stat-card .stat-change.down { color: #dc2626; }
        .stat-card .stat-change.warning { color: #f59e0b; }

        .integration-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding: 12px 16px;
          background: var(--bg);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          margin-bottom: 16px;
          align-items: center;
        }
        .integration-bar .g-icon { width: 20px; height: 20px; }

        .table-container {
          background: var(--card-bg);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow);
        }
        .table-toolbar {
          padding: 12px 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }
        .table-wrapper { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        thead { background: var(--bg); border-bottom: 1px solid var(--border); }
        th { text-align: left; padding: 10px 14px; font-weight: 600; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-light); white-space: nowrap; }
        td { padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        tr:hover td { background: var(--bg); }

        .badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
        }
        .badge-nuevo { background: #dbeafe; color: #1e40af; }
        .badge-contactado { background: #fef3c7; color: #92400e; }
        .badge-consulta { background: #e0e7ff; color: #3730a3; }
        .badge-retainer { background: #ddd6fe; color: #5b21b6; }
        .badge-contratado { background: #d1fae5; color: #065f46; }
        .badge-cerrado { background: #e5e7eb; color: #4b5563; }
        .badge-perdido { background: #fee2e2; color: #991b1b; }
        .badge-prioridad-alta { background: #fee2e2; color: #991b1b; }
        .badge-prioridad-media { background: #fef3c7; color: #92400e; }
        .badge-prioridad-baja { background: #dbeafe; color: #1e40af; }

        .kanban-board {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .kanban-column {
          background: var(--card-bg);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 12px;
          min-height: 300px;
        }
        .kanban-column .column-header {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-light);
          padding-bottom: 10px;
          border-bottom: 2px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kanban-column .column-header .count { background: var(--bg); padding: 0 10px; border-radius: 12px; font-size: 11px; }
        .kanban-card {
          background: var(--bg);
          padding: 12px 14px;
          border-radius: 8px;
          margin-bottom: 8px;
          border-left: 3px solid var(--gold);
          cursor: pointer;
          transition: var(--transition);
        }
        .kanban-card:hover { transform: translateX(4px); box-shadow: var(--shadow); }
        .kanban-card .card-title { font-weight: 600; font-size: 14px; }
        .kanban-card .card-sub { font-size: 12px; color: var(--text-light); margin-top: 2px; }
        .kanban-card .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 11px; color: var(--text-light); }
        .kanban-card .card-footer .assignee { background: var(--card-bg); padding: 0 8px; border-radius: 10px; font-size: 10px; }

        .detail-panel {
          display: none;
          background: var(--card-bg);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          padding: 20px 24px;
          margin-top: 20px;
          box-shadow: var(--shadow-lg);
        }
        .detail-panel.open { display: block; animation: fadeIn 0.3s ease; }
        .detail-panel .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .detail-panel .detail-header h3 { font-size: 20px; }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 16px;
        }
        .detail-item label { font-size: 10px; text-transform: uppercase; color: var(--text-light); font-weight: 700; letter-spacing: 0.5px; display: block; }
        .detail-item .value { font-size: 14px; margin-top: 2px; font-weight: 500; }

        .task-list { margin-top: 12px; }
        .task-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--bg);
          border-radius: 8px;
          margin-bottom: 4px;
          border: 1px solid var(--border);
        }
        .task-add {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .modal-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-overlay.open { display: flex; }
        .modal {
          background: var(--card-bg);
          border-radius: var(--radius-lg);
          padding: 28px 32px;
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 80px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal h2 { font-size: 20px; margin-bottom: 2px; }
        .modal .modal-sub { color: var(--text-light); font-size: 13px; margin-bottom: 20px; }
        .modal .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .modal .form-group { margin-bottom: 14px; }
        .modal .form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
        .modal .form-group label .required { color: #dc2626; }
        .modal .form-group input, .modal .form-group select, .modal .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          transition: var(--transition);
          background: var(--card-bg);
          color: var(--text);
        }
        .modal .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border); }
        .modal .modal-actions .btn-cancel { background: var(--bg); color: var(--text); border: none; padding: 8px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .modal .modal-actions .btn-save { background: var(--gold-gradient); color: var(--primary); border: none; padding: 8px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }

        .empty-state { padding: 40px 20px; text-align: center; color: var(--text-light); }
        .empty-state .emoji { font-size: 44px; display: block; margin-bottom: 10px; }
        .empty-state h3 { color: var(--text); font-size: 18px; }

        .theme-toggle {
          background: none;
          border: none;
          color: rgba(255,255,255,0.6);
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: var(--transition);
        }
        .theme-toggle:hover { background: rgba(255,255,255,0.1); color: #fff; }

        .text-muted { color: var(--text-light); }
        .flex-between { display: flex; justify-content: space-between; align-items: center; }
        .ai-chat-container { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .ai-chat-messages { height: 200px; overflow-y: auto; padding: 16px; background: var(--bg); }
        .ai-chat-message { margin-bottom: 12px; padding: 10px 14px; border-radius: var(--radius); max-width: 80%; }
        .ai-chat-message.user { background: var(--gold); color: var(--primary); margin-left: auto; }
        .ai-chat-message.assistant { background: var(--card-bg); border: 1px solid var(--border); }
        .ai-chat-input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--border); background: var(--card-bg); }
      `}</style>

      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="main">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="page-title">
              {currentView === 'dashboard' && 'Dashboard <small>Panel de control y métricas</small>'}
              {currentView === 'kanban' && 'Pipeline <small>Visualización Kanban de leads</small>'}
              {currentView === 'leads' && 'Leads <small>Gestión de potenciales clientes</small>'}
              {currentView === 'leadDetail' && 'Detalle de Lead'}
              {currentView === 'clientes' && 'Clientes <small>Clientes activos de la firma</small>'}
              {currentView === 'casos' && 'Casos <small>Casos legales en curso</small>'}
              {currentView === 'eoir' && 'EOIR <small>Gestión de cortes de inmigración</small>'}
              {currentView === 'uscis' && 'USCIS <small>Seguimiento de peticiones</small>'}
              {currentView === 'bia' && 'BIA <small>Apelaciones y remisiones</small>'}
              {currentView === 'documentos' && 'Documentos <small>Organización de archivos</small>'}
              {currentView === 'tareas' && 'Tareas <small>Gestión de tareas del equipo</small>'}
              {currentView === 'calendario' && 'Calendario <small>Audiencias, consultas y plazos</small>'}
              {currentView === 'facturacion' && 'Facturación <small>Contratos y pagos</small>'}
              {currentView === 'ia' && 'Asistente IA <small>Generación de documentos y formularios</small>'}
              {currentView === 'automatizaciones' && 'Automatizaciones <small>Reglas y flujos de trabajo</small>'}
              {currentView === 'usuarios' && 'Usuarios <small>Equipo de trabajo</small>'}
              {currentView === 'configuracion' && 'Configuración <small>Preferencias de la firma</small>'}
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => toast.success('📥 Datos exportados')}>📥 Exportar</button>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              toast.loading('🔄 Sincronizando...')
              setTimeout(() => { toast.dismiss(); toast.success('✅ Datos sincronizados') }, 1500)
            }}>🔄 Sincronizar</button>
            <button className="btn btn-primary" onClick={() => setShowLeadModal(true)}>+ Nuevo Lead</button>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'leads' && renderLeadsList()}
          {currentView === 'kanban' && renderKanban()}
          {currentView === 'leadDetail' && renderLeadDetail()}
          {currentView === 'uscis' && renderUSCIS()}
          {currentView === 'ia' && renderIA()}
          {currentView === 'automatizaciones' && renderAutomations()}
          {['clientes', 'casos', 'eoir', 'bia', 'documentos', 'tareas', 'calendario', 'facturacion', 'usuarios', 'configuracion'].includes(currentView) && 
            renderEmptyView(
              currentView.charAt(0).toUpperCase() + currentView.slice(1),
              currentView === 'clientes' ? '👥' :
              currentView === 'casos' ? '⚖️' :
              currentView === 'eoir' ? '🏛️' :
              currentView === 'bia' ? '📜' :
              currentView === 'documentos' ? '📁' :
              currentView === 'tareas' ? '✅' :
              currentView === 'calendario' ? '📅' :
              currentView === 'facturacion' ? '💰' :
              currentView === 'usuarios' ? '👥' :
              '⚙️',
              `Módulo de ${currentView} en desarrollo`
            )
          }
        </div>
      </div>

      {/* Modal de creación */}
      {renderModal()}
    </div>
  )
}