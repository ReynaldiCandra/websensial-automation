'use client'

import { useState } from 'react'
import { Copy, Check, Key, RefreshCw } from 'lucide-react'

type Method = 'GET' | 'POST' | 'DELETE'
interface Endpoint { method: Method; path: string; desc: string; body: string | null; response: string }
interface Section { section: string; items: Endpoint[] }

const b = (obj: object) => JSON.stringify(obj, null, 2)

const ENDPOINTS: Section[] = [
  { section: 'Authentication', items: [
    { method: 'POST', path: '/api/auth/token', desc: 'Generate token', body: b({email:'you@example.com',password:'pass'}), response: b({token:'wsa_live_xxx'}) },
  ]},
  { section: 'Leads', items: [
    { method: 'GET', path: '/api/leads', desc: 'Ambil semua leads', body: null, response: b([{id:'uuid',name:'Budi',score:87}]) },
    { method: 'POST', path: '/api/leads', desc: 'Tambah lead', body: b({name:'Budi',phone:'62812'}), response: b({id:'uuid'}) },
  ]},
  { section: 'Messages', items: [
    { method: 'POST', path: '/api/whatsapp/send', desc: 'Kirim pesan WA', body: b({to:'62812',message:'Halo!'}), response: b({messageId:'msg_xxx'}) },
  ]},
  { section: 'Quotations', items: [
    { method: 'GET', path: '/api/quotations', desc: 'Ambil quotations', body: null, response: b([{id:'uuid',total_amount:500000}]) },
    { method: 'POST', path: '/api/quotations', desc: 'Buat quotation', body: b({leadId:'uuid',items:[]}), response: b({id:'uuid'}) },
  ]},
  { section: 'Invoices', items: [
    { method: 'GET', path: '/api/invoices', desc: 'Ambil invoices', body: null, response: b([{id:'uuid',status:'pending'}]) },
    { method: 'POST', path: '/api/payment?action=create', desc: 'Buat payment link', body: b({invoiceId:'uuid'}), response: b({paymentUrl:'https://app.midtrans.com/...'}) },
  ]},
  { section: 'Webhooks', items: [
    { method: 'POST', path: '/api/payment?action=webhook', desc: 'Midtrans webhook', body: b({order_id:'INV-xxx',transaction_status:'settlement'}), response: b({ok:true}) },
  ]},
]

const MC: Record<string, {bg:string;color:string}> = {
  GET: { bg: '#E6F1FB', color: '#185FA5' },
  POST: { bg: '#E1F5EE', color: '#0F6E56' },
  DELETE: { bg: '#FCEBEB', color: '#A32D2D' },
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div style={{ position: 'relative', background: '#0f172a', borderRadius: 8, padding: '12px 14px', marginTop: 6 }}>
      <button
        onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '3px 6px', cursor: 'pointer', color: 'white' }}>
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
      <pre style={{ margin: 0, fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{code}</pre>
    </div>
  )
}

export default function ApiDocsPage() {
  const [active, setActive] = useState('Authentication')
  const [keyCopied, setKeyCopied] = useState(false)
  const items = ENDPOINTS.find(e => e.section === active)?.items || []

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 60px)' }}>
      <div style={{ width: 200, borderRight: '0.5px solid #e5e7eb', padding: '20px 12px', flexShrink: 0, background: '#fafafa' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 12px 8px' }}>Endpoints</p>
        {ENDPOINTS.map(({ section }) => (
          <button key={section} onClick={() => setActive(section)}
            style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 6, border: 'none', background: active === section ? '#E1F5EE' : 'transparent', color: active === section ? '#0F6E56' : '#374151', fontSize: 13, fontWeight: active === section ? 500 : 400, cursor: 'pointer', marginBottom: 2 }}>
            {section}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>API Documentation</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            Base URL: <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>https://yourapp.vercel.app</code>
          </p>
        </div>

        <div style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Key size={14} color="#6b7280" />
            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>API Key kamu</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <code style={{ flex: 1, background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace' }}>
              wsa_live_••••••••••••••
            </code>
            <button
              onClick={() => { setKeyCopied(true); setTimeout(() => setKeyCopied(false), 2000) }}
              style={{ padding: '8px 12px', border: '0.5px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
              {keyCopied ? <Check size={12} color="#0F6E56" /> : <Copy size={12} />}
              {keyCopied ? 'Copied' : 'Copy'}
            </button>
            <button style={{ padding: '8px 12px', border: '0.5px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
              <RefreshCw size={12} /> Regenerate
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Header: <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 3 }}>Authorization: Bearer api_key</code>
          </p>
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{active}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((ep, i) => (
            <div key={i} style={{ border: '0.5px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: MC[ep.method]?.bg, color: MC[ep.method]?.color }}>
                  {ep.method}
                </span>
                <code style={{ fontSize: 13, fontFamily: 'monospace', color: '#111' }}>{ep.path}</code>
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>{ep.desc}</span>
              </div>
              <div style={{ padding: 16 }}>
                {ep.body && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>Request Body</p>
                    <CodeBlock code={ep.body} />
                  </div>
                )}
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>Response</p>
                  <CodeBlock code={ep.response} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
