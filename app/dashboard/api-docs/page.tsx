'use client'

import { useState } from 'react'
import { Copy, Check, Code2, BookOpen, Lock, Zap } from 'lucide-react'

type Method = 'GET' | 'POST' | 'DELETE'
interface Endpoint { method: Method; path: string; desc: string; body: string | null; response: string }
interface Section { section: string; items: Endpoint[] }

const b = (obj: object) => JSON.stringify(obj, null, 2)

const ENDPOINTS: Section[] = [
  { section: 'Authentication', items: [
    { method: 'POST', path: '/api/auth/token', desc: 'Generate API token untuk akses programmatic', body: b({email:'you@example.com',password:'pass'}), response: b({token:'wsa_live_xxx',expires_in:86400}) },
  ]},
  { section: 'Leads', items: [
    { method: 'GET', path: '/api/leads', desc: 'Ambil semua leads dengan pagination', body: null, response: b([{id:'uuid',name:'Budi',phone:'62812xxx',score:87,temperature:'hot'}]) },
    { method: 'POST', path: '/api/leads', desc: 'Tambah lead baru ke sistem', body: b({name:'Budi',phone:'62812xxx',email:'budi@example.com'}), response: b({id:'uuid',created_at:'2024-01-01T00:00:00Z'}) },
  ]},
  { section: 'Messages', items: [
    { method: 'POST', path: '/api/whatsapp/send', desc: 'Kirim pesan WhatsApp ke customer', body: b({to:'62812xxx',message:'Halo, ada yang bisa kami bantu?',leadId:'uuid'}), response: b({messageId:'msg_xxx',status:'sent',timestamp:'2024-01-01T00:00:00Z'}) },
  ]},
  { section: 'Quotations', items: [
    { method: 'GET', path: '/api/quotations', desc: 'Ambil semua quotations', body: null, response: b([{id:'uuid',leadId:'uuid',total_amount:500000,status:'sent'}]) },
    { method: 'POST', path: '/api/quotations', desc: 'Buat quotation baru', body: b({leadId:'uuid',items:[{product:'Product A',qty:2,price:250000}]}), response: b({id:'uuid',quotation_number:'QT-001',total_amount:500000}) },
  ]},
  { section: 'Invoices', items: [
    { method: 'GET', path: '/api/invoices', desc: 'Ambil semua invoices', body: null, response: b([{id:'uuid',status:'pending',total_amount:500000}]) },
    { method: 'POST', path: '/api/payment?action=create', desc: 'Buat payment link untuk invoice', body: b({invoiceId:'uuid'}), response: b({paymentUrl:'https://app.midtrans.com/...',paymentId:'pay_xxx'}) },
  ]},
  { section: 'Webhooks', items: [
    { method: 'POST', path: '/api/payment?action=webhook', desc: 'Webhook dari Midtrans untuk status pembayaran', body: b({order_id:'INV-xxx',transaction_status:'settlement',gross_amount:'500000'}), response: b({ok:true,message:'Payment verified'}) },
  ]},
]

const MC: Record<string, {bg:string;color:string;bgLight:string}> = {
  GET: { bg: '#3B82F6', color: '#E0F2FE', bgLight: '#E0F2FE33' },
  POST: { bg: '#10B981', color: '#D1FAE5', bgLight: '#D1FAE533' },
  DELETE: { bg: '#EF4444', color: '#FEE2E2', bgLight: '#FEE2E233' },
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ position: 'relative', background: '#0f172a', borderRadius: 8, padding: '12px 14px', marginTop: 6, fontFamily: 'monospace' }}>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre style={{ color: '#e2e8f0', fontSize: 12, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', paddingRight: 60 }}>
        {code}
      </pre>
    </div>
  )
}

export default function ApiDocsPage() {
  const [selectedSection, setSelectedSection] = useState(0)
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set([ENDPOINTS[0].items[0].path]))

  const toggleEndpoint = (path: string) => {
    const newSet = new Set(expandedEndpoints)
    newSet.has(path) ? newSet.delete(path) : newSet.add(path)
    setExpandedEndpoints(newSet)
  }

  return (
    <div style={{ padding: '24px', background: '#0D0D12', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Code2 size={32} style={{ color: '#6C3BF5' }} />
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#E2E8F0', margin: 0 }}>API Documentation</h1>
            <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>Dokumentasi lengkap untuk mengintegrasikan Websensial ke aplikasi Anda</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#10B98133', borderRadius: 6, fontSize: 12, color: '#10B981' }}>
            <BookOpen size={14} /> Base URL: https://api.websensial.ai/v1
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#6C3BF533', borderRadius: 6, fontSize: 12, color: '#A78BFA' }}>
            <Lock size={14} /> Authentication: Bearer Token
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {ENDPOINTS.map((section, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSection(idx)}
              style={{
                padding: '12px 16px',
                background: selectedSection === idx ? 'rgba(108,59,245,0.15)' : 'transparent',
                border: 'none',
                borderLeft: selectedSection === idx ? '3px solid #6C3BF5' : '3px solid transparent',
                borderRadius: 0,
                color: selectedSection === idx ? '#A78BFA' : '#64748B',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              {section.section}
            </button>
          ))}
        </div>

        <div>
          {ENDPOINTS[selectedSection].items.map(endpoint => (
            <div key={endpoint.path} style={{ marginBottom: 24, background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <button
                onClick={() => toggleEndpoint(endpoint.path)}
                style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ display: 'inline-block', padding: '4px 8px', background: MC[endpoint.method].bgLight, color: MC[endpoint.method].bg, borderRadius: 4, fontSize: 11, fontWeight: 700, minWidth: 50, textAlign: 'center' }}>
                  {endpoint.method}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: 0 }}>{endpoint.path}</p>
                  <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>{endpoint.desc}</p>
                </div>
              </button>

              {expandedEndpoints.has(endpoint.path) && (
                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(15,13,18,0.5)' }}>
                  {endpoint.body && (
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', margin: '0 0 8px', textTransform: 'uppercase' }}>Request Body</p>
                      <CodeBlock code={endpoint.body} />
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0', margin: '0 0 8px', textTransform: 'uppercase' }}>Response</p>
                    <CodeBlock code={endpoint.response} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 24, background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', margin: '0 0 12px' }}>Authentication</h2>
        <p style={{ color: '#64748B', fontSize: 13, margin: '0 0 12px' }}>
          Semua request API harus menyertakan token di header Authorization:
        </p>
        <CodeBlock code={`curl -X GET https://api.websensial.ai/v1/leads \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json"`} />
      </div>
    </div>
  )
}
