'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

type LeadTemperature = 'hot' | 'warm' | 'cold'
type PipelineStage = 'tanya_produk' | 'penawaran' | 'invoice_sent' | 'bukti_bayar' | 'won' | 'lost'

interface Lead {
  id: string
  name: string
  phone: string
  email?: string
  score: number
  temperature: LeadTemperature
  pipeline_stage: PipelineStage
  deal_value: number
  stage_changed_at: string
  created_at: string
}

const STAGES: { key: PipelineStage; label: string; color: string; bgLight: string }[] = [
  { key: 'tanya_produk', label: '📝 Tanya Produk', color: '#888780', bgLight: '#F1EFE8' },
  { key: 'penawaran', label: '💼 Penawaran', color: '#185FA5', bgLight: '#E6F1FB' },
  { key: 'invoice_sent', label: '📄 Invoice Sent', color: '#BA7517', bgLight: '#FAEEDA' },
  { key: 'bukti_bayar', label: '💳 Bukti Bayar', color: '#D85A30', bgLight: '#FAECE7' },
  { key: 'won', label: '✅ Won', color: '#0F6E56', bgLight: '#E1F5EE' },
  { key: 'lost', label: '❌ Lost', color: '#A32D2D', bgLight: '#FCEBEB' },
]

function TempBadge({ t }: { t: LeadTemperature }) {
  const config = {
    hot: { bg: '#FCEBEB', color: '#A32D2D' },
    warm: { bg: '#FAEEDA', color: '#854F0B' },
    cold: { bg: '#F1EFE8', color: '#5F5E5A' },
  }
  const c = config[t]
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 10, padding: '2px 8px', borderRadius: 12, fontWeight: 600, textTransform: 'uppercase' }}>
      {t === 'hot' ? '🔥 Hot' : t === 'warm' ? '🟡 Warm' : '❄️ Cold'}
    </span>
  )
}

function DraggableCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-900 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition cursor-move"
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <GripVertical size={14} className="text-slate-600 flex-shrink-0 mt-0.5" {...listeners} {...attributes} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: '0 0 2px' }}>{lead.name}</p>
              <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{lead.phone}</p>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>
              Rp {(lead.deal_value / 1000000).toFixed(1)}M
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'space-between' }}>
            <TempBadge t={lead.temperature} />
            <span style={{ fontSize: 10, color: '#64748B' }}>Score: {lead.score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PipelineColumn({ stage, leads }: { stage: (typeof STAGES)[0]; leads: Lead[] }) {
  const { setNodeRef } = useSortable({ id: stage.key })
  
  return (
    <div style={{ flex: '0 0 340px', display: 'flex', flexDirection: 'column', maxHeight: '100%' }}>
      <div style={{ padding: '12px 16px', background: stage.bgLight, borderRadius: 8, marginBottom: 12, borderLeft: `4px solid ${stage.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: stage.color }}>{stage.label}</span>
          <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: 4, color: stage.color, fontWeight: 600 }}>
            {leads.length}
          </span>
        </div>
      </div>
      <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 8 }}
        >
          {leads.length > 0 ? (
            leads.map(lead => <DraggableCard key={lead.id} lead={lead} />)
          ) : (
            <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 12 }}>
              <p style={{ margin: 0, opacity: 0.5 }}>Drag leads here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function useDroppable({ id }: { id: string }) {
  const { setNodeRef } = useSortable({ id })
  return { setNodeRef }
}

export default function PipelinePage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    if (data) setLeads(data as Lead[])
    setLoading(false)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const leadId = active.id as string
    const newStage = over.id as PipelineStage
    
    await supabase.from('leads').update({ pipeline_stage: newStage }).eq('id', leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipeline_stage: newStage } : l))
  }

  const stats = {
    totalDeals: leads.length,
    totalValue: leads.reduce((sum, l) => sum + l.deal_value, 0),
    hotLeads: leads.filter(l => l.temperature === 'hot').length,
    winRate: leads.length > 0 ? ((leads.filter(l => l.pipeline_stage === 'won').length / leads.length) * 100).toFixed(1) : 0,
  }

  return (
    <div style={{ padding: '24px', background: '#0D0D12', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Deals', value: stats.totalDeals, icon: '📊' },
          { label: 'Pipeline Value', value: `Rp ${(stats.totalValue / 1000000).toFixed(1)}M`, icon: '💰' },
          { label: '🔥 Hot Leads', value: stats.hotLeads, icon: '🎯' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: '✅' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', margin: '0 0 8px', fontWeight: 600 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#64748B', padding: 40 }}>Loading pipeline...</div>
      ) : (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
            {STAGES.map(stage => (
              <PipelineColumn
                key={stage.key}
                stage={stage}
                leads={leads.filter(l => l.pipeline_stage === stage.key)}
              />
            ))}
          </div>
          <DragOverlay />
        </DndContext>
      )}
    </div>
  )
}
