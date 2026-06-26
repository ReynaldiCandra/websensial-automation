'use client'

import { useState, useEffect } from 'react'
import { Smartphone, CheckCircle, XCircle, RefreshCw, Wifi } from 'lucide-react'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<'loading'|'disconnected'|'connecting'|'connected'>('loading')
  const [qr, setQr] = useState<string|null>(null)
  const [phone, setPhone] = useState<string|null>(null)
  const [polling, setPolling] = useState(false)

  const WAHA = process.env.NEXT_PUBLIC_WAHA_URL || 'https://waha-production-5547.up.railway.app'
  const KEY = process.env.NEXT_PUBLIC_WAHA_KEY || 'websensial123'

  async function checkStatus() {
    try {
      const res = await fetch('/api/whatsapp/waha-status')
      const data = await res.json()
      if (data.status === 'WORKING') {
        setStatus('connected')
        setPhone(data.me?.id?.replace('@c.us','') || null)
        setQr(null)
      } else if (data.status === 'STARTING' || data.status === 'SCAN_QR_CODE') {
        setStatus('connecting')
        fetchQR()
      } else {
        setStatus('disconnected')
      }
    } catch {
      setStatus('disconnected')
    }
  }

  async function fetchQR() {
    try {
      const res = await fetch('/api/whatsapp/waha-qr')
      const data = await res.json()
      if (data.qr) setQr(data.qr)
    } catch {}
  }

  async function startSession() {
    setStatus('connecting')
    try {
      await fetch('/api/whatsapp/waha-start', { method: 'POST' })
      setTimeout(() => { fetchQR(); startPolling() }, 3000)
    } catch {}
  }

  async function disconnect() {
    await fetch('/api/whatsapp/waha-stop', { method: 'POST' })
    setStatus('disconnected')
    setQr(null)
    setPhone(null)
  }

  function startPolling() {
    setPolling(true)
    let count = 0
    const interval = setInterval(async () => {
      count++
      await checkStatus()
      if (count > 30) { clearInterval(interval); setPolling(false) }
    }, 3000)
  }

  useEffect(() => { checkStatus() }, [])

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#F1F5F9', margin: 0 }}>WhatsApp</h1>
        <p style={{ fontSize: 13, color: '#4A5568', marginTop: 4 }}>Hubungkan nomor WhatsApp bisnis kamu</p>
      </div>

      <div style={{ maxWidth: 480, background: '#16161F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32, textAlign: 'center' }}>

        {/* Status Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, marginBottom: 24,
          background: status === 'connected' ? 'rgba(104,211,145,0.1)' : status === 'connecting' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${status === 'connected' ? 'rgba(104,211,145,0.3)' : status === 'connecting' ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: status === 'connected' ? '#68D391' : status === 'connecting' ? '#FBbF24' : '#FC8181' }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: status === 'connected' ? '#68D391' : status === 'connecting' ? '#FBbF24' : '#FC8181' }}>
            {status === 'connected' ? 'Terhubung' : status === 'connecting' ? 'Menghubungkan...' : status === 'loading' ? 'Memuat...' : 'Tidak terhubung'}
          </span>
        </div>

        {/* Connected State */}
        {status === 'connected' && (
          <div>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(104,211,145,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={36} color="#68D391" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', margin: '0 0 8px' }}>WhatsApp Terhubung!</h3>
            {phone && <p style={{ fontSize: 13, color: '#4A5568', margin: '0 0 24px' }}>+{phone}</p>}
            <button onClick={disconnect}
              style={{ padding: '10px 24px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#FC8181', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Putuskan Koneksi
            </button>
          </div>
        )}

        {/* QR State */}
        {status === 'connecting' && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', margin: '0 0 8px' }}>Scan QR Code</h3>
            <p style={{ fontSize: 13, color: '#4A5568', margin: '0 0 20px' }}>Buka WhatsApp → Perangkat Tertaut → Tautkan Perangkat</p>
            {qr ? (
              <div style={{ background: 'white', padding: 16, borderRadius: 12, display: 'inline-block', marginBottom: 20 }}>
                <img src={qr} alt="QR Code" style={{ width: 200, height: 200 }} />
              </div>
            ) : (
              <div style={{ width: 232, height: 232, background: 'rgba(255,255,255,0.04)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <RefreshCw size={24} color="#4A5568" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={fetchQR}
                style={{ padding: '8px 16px', background: 'rgba(108,59,245,0.15)', border: '1px solid rgba(108,59,245,0.3)', borderRadius: 8, color: '#A78BFA', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} /> Refresh QR
              </button>
            </div>
          </div>
        )}

        {/* Disconnected State */}
        {(status === 'disconnected' || status === 'loading') && (
          <div>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(108,59,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Smartphone size={36} color="#6C3BF5" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', margin: '0 0 8px' }}>Hubungkan WhatsApp</h3>
            <p style={{ fontSize: 13, color: '#4A5568', margin: '0 0 24px', lineHeight: 1.6 }}>
              Klik tombol di bawah untuk generate QR code, lalu scan dengan WhatsApp bisnis kamu.
            </p>
            <button onClick={startSession}
              style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#6C3BF5,#4F1FD4)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Wifi size={16} /> Hubungkan WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{ maxWidth: 480, marginTop: 16, background: '#16161F', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600, color: '#CBD5E0', margin: '0 0 12px' }}>Cara menghubungkan:</h4>
        {[
          'Klik "Hubungkan WhatsApp" di atas',
          'Buka WhatsApp di HP kamu',
          'Ketuk titik tiga (⋮) → Perangkat Tertaut',
          'Ketuk "Tautkan Perangkat"',
          'Scan QR code yang muncul',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(108,59,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#A78BFA', flexShrink: 0 }}>
              {i + 1}
            </div>
            <span style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
