'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

const STAGES: { key: PipelineStage; label: string; color: string; bg: string }[] = [
  { key: 'tanya_produk', label: 'Tanya Produk', color: '#888780', bg: '#F1EFE8' },
  { key: 'penawaran', label: 'Penawaran', color: '#185FA5', bg: '#E6F1FB' },
  { key: 'invoice_sent', label: 'Invoice Sent', color: '#BA7517', bg: '#FAEEDA' },
  { key: 'bukti_bayar', label: 'Bukti Bayar', color: '#D85A30', bg: '#FAECE7' },
  { key: 'won', label: 'Won ✓', color: '#0F6E56', bg: '#E1F5EE' },
  { key: 'lost', label: 'Lost ✗', color: '#A32D2D', bg: '#FCEBEB' },
]

function tempBadge(t: LeadTemperature) {
  if (t === 'hot') return <span style={{background:'#FCEBEB',color:'#A32D2D',fontSize:11,padding:'2px 8px',borderRadius:99,fontWeight:500}}>Hot</span>
  if (t === 'warm') return <span style={{background:'#FAEEDA',color:'#854F0B',fontSize:11,padding:'2px 8px',borderRadius:99,fontWeight:500}}>Warm</span>
  return <span style={{background:'#F1EFE8',color:'#5F5E5A',fontSize:11,padding:'2px 8px',borderRadius:99,fontWeight:500}}>Cold</span>
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function timeSince(dateStr: string) {
  const diff = Date.now() w Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hari ini'
  if (days === 1) return '1 hari lalu'
  return `${days} hari lalu`
}

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div style={{width:32,height:32,borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,color:'#185FA5',flexShrink:0}}>
          {initials(lead.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{lead.name}</p>
          <p className="text-xs text-gray-500 truncate">{lead.phone}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        {tempBadge(lead.temperature)}
        <span className="text-xs text-gray-500">{timeSince(lead.stage_changed_at)}</span>
      </div>
      {lead.deal_value > 0 && (
        <p className="text-xs font-medium text-gray-700 mt-1">
          Rp{lead.deal_value.toLocaleString('id-ID')}
        </p>
      )}
    </div>
  )
}

function SidePanel({ lead, onClose, onStageChange }: { lead: Lead; onClose: () => void; onStageChange: (stage: PipelineStage) => void }) {
  return (
    <div style={{position:'fixed',right:0,top:0,height:'100vh',width:340,background:'white',borderLeft:'0.5px solid #e5e7eb',zIndex:50,overflowY:'auto',padding:24}}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-base">{lead.name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>

      <div style={{background:'#F1EFE8',borderRadius:8,padding:12,marginBottom:16}}>
        <p className="text-xs text-gray-500 mb-1">Lead Score</p>
        <div className="flex items-center gap-2">
          <span style={{fontSize:28,fontWeight:500}}>{lead.score}</span>
          <span style={{fontSize:12}}>/100</span>
          {tempBadge(lead.temperature)}
        </div>
        <div style={{height:4,background:'#D3D1C7',borderRadius:2,marginTop:8}}>
          <div style={{height:4,background: lead.temperature==='hot'?'#E24B4A':lead.temperature==='warm'?'#BA7517':'#888780',borderRadius:2,width:`${lead.score}%`}}/>
       </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Pindah Stage</p>
        <div className="flex flex-col gap-1">
          {STAGES.map(s => (
            <button key={s.key} onClick={() => onStageChange(s.key)}
              style={{textAlign:'left',padding:'6px 10px',borderRadius:6,border:`0.5px solid ${lead.pipeline_stage===s.key?s.color:'#e5e7eb'}`,background:lead.pipeline_stage===s.key?s.bg:'transparent',color:lead.pipeline_stage===s.key?s.color:'#374151',fontSize:13,cursor:'pointer'}}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Nilai Deal</p>
        <p className="font-medium">Rp{lead.deal_value.toLocaleString('id-ID')}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button style={{flex:1,padding:'8px 12px',background:'#E1F5EE',color:'#0F6E56',border:'none',borderRadius:6,fontSize:12,fontWeight:500,cursor:'pointer'}}>
          Kirim Quotation
        </button>
        <button style={{flex:1,padding:'8px 12px',background:'#E6F1FB',color:'#185FA5',border:'none',borderRadius:6,fontSize:12,fontWeight:500,cursor:'pointer'}}>
          Buat Invoice
        </button>
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setLeads(data as Lead[])
    setLoading(false)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const leadId = active.id as string
    const newStage = over.id as PipelineStage
    if (!STAGES.find(s => s.key === newStage)) return

    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipeline_stage: newStage, stage_changed_at: new Date().toISOString() } : l))
    await supabase.from('leads').update({ pipeline_stage: newStage, stage_changed_at: new Date().toISOString() }).eq('id', leadId)
    setActiveId(null)
  }

  async function handleStageChange(stage: PipelineStage) {
    if (!selectedLead) return
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, pipeline_stage: stage, stage_changed_at: new Date().toISOString() } : l))
    setSelectedLead(prev => prev ? { ...prev, pipeline_stage: stage } : null)
    await supabase.from('leads').update({ pipeline_stage: stage, stage_changed_at: new Date().toISOString() }).eq('id', selectedLead.id)
  }

  const totalValue = leads.filter(l => l.pipeline_stage !== 'lost').reduce((s, l) => s + (l.deal_value || 0), 0)
  const wonLeads = leads.filter(l => l.pipeline_stage === 'won').length
  const convRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0
  const hotLeads = leads.filter(l => l.temperature === 'hot').length

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500">Memuat pipeline...</div>

  return (
    <div style={{padding:24,minHeight:'100vh'}}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{fontSize:22,fontWeight:500,margin:0}}>Pipeline</h1>
          <p style={{fontSize:14,color:'#6b7280',marginTop:4}}>Pantau semua deal dari awal sampai closing</p>
        </div>
        <button onClick={fetchLeads} style={{padding:'8px 16px',border:'0.5px solid #e5e7eb',borderRadius:8,background:'white',fontSize:13,cursor:'pointer'}}>
          Refresh
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[
          { label: 'Total Leads', value: leads.length },
          { label: 'Hot Leads', value: hotLeads },
          { label: 'Conversion Rate', value: `${convRate}%` },
          { label: 'Total Pipeline Value', value: `Rp${(totalValue/1000000).toFixed(1)}jt` },
        ].map(stat => (
          <div key={stat.label} style={{background:'#F9FAFB',borderRadius:8,padding:12}}>
            <p style={{fontSize:12,color:'#6b7280',margin:0}}>{stat.label}</p>
            <p style={{fontSize:22,fontWeight:500,margin:'4px 0 0'}}>{stat.value}</p>
          </div>
        ))}
      </div>

      <DndContext collisionDetection={closestCenter} onDragStart={e => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,overflowX:'auto'}}>
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.pipeline_stage === stage.key)
            const stageValue = stageLeads.reduce((s, l) => s + (l.deal_value || 0), 0)
            return (
              <div key={stage.key} style={{minWidth:180}}>
                <div style={{background:stage.bg,borderRadius:8,padding:'8px 12px',marginBottom:8}}>
                  <div className="flex items-center justify-between">
                    <span style={{fontSize:12,fontWeight:500,color:stage.color}}>{stage.label}</span>
                    <span style={{fontSize:11,background:'white',color:stage.color,padding:'1px 7px',borderRadius:99,border:`0.5px solid ${stage.color}`}}>{stageLeads.length}</span>
                  </div>
                  {stageValue > 0 && <p style={{fontSize:11,color:stage.color,margin:'4px 0 0'}}>Rp{stageValue.toLocaleString('id-ID')}</p>}
                </div>

                <SortableContext items={stageLeads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                  <div style={{minHeight:80}} id={stage.key}>
                    {stageLeads.map(lead => (
                      <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />
                    ))}
                  </div>
                </SortableContext>
              </div>
            )
          })}
        </div>
      </DndContext>

      {selectedLead && (
        <SidePanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStageChange={handleStageChange}
        />
      )}
    </div>
  )
}
