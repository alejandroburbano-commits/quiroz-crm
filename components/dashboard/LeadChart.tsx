'use client'

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

interface LeadChartProps {
  leads: any[]
}

export function LeadChart({ leads }: LeadChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir gráfico anterior
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    // Datos para el gráfico
    const statuses = ['new', 'contacted', 'consultation_scheduled', 'consultation_completed', 'client_retained', 'lost']
    const labels = ['Nuevo', 'Contactado', 'Consulta', 'Completado', 'Retenido', 'Perdido']
    const data = statuses.map(s => leads?.filter(l => l.status === s).length || 0)

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#22c55e', '#ef4444'],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 8,
              color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#333'
            }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [leads])

  return (
    <div className="h-[250px]">
      <canvas ref={chartRef} />
    </div>
  )
}