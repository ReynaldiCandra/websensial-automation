'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Smartphone, CheckCircle, XCircle, RefreshCw,
  Wifi, WifiOff, QrCode, AlertCircle
} from 'lucide-react'

type WAStatus = 'loading' | 'disconnected' | 'connecting' | 'connected' | 'failed'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WAStatus>('loading')
  const [qr, setQr] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<string | null>(null)
  const [qrExpiry, setQrExpiry] = useState<number>(0)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const qrTimerRef = useRef<NodeJS.Timeout | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/waha-status')
      const data = await res.json()
      setLastChecked(new Date().toLocaleTimeString('id-ID'))

      if (data.status === 'WORKING') {
        setStatus('connected')
        setPhone(data.me?.id?.replace('@c.us', '') ?? null)
        setQr(null)
        stopPolling()
      } else if (data.status === 'SCAN_QR_CODE' || data.status === 'STARTING') {
        setStatus('connecting')
        await fetchQR()
      } else if (data.status === 'FAILED') {
        setStatus('failed')
        setQr(null)
      } else {
        setStatus('disconnected')
        setQr(null)
      }
    } catch {
      setStatus('disconnected')
    }
  }, [])

  const fetchQR = async () => {
    try {
      const res = await fetch('/api/whatsapp/waha-qr')
      const data = await res.json()
      if (data.qr) {
        setQr(data.qr)
        setQrExpiry(60)
      }
    } catch {}
  }

  const startSession = async () => {
    setLoading(true)
    setStatus('connecting')
    setQr(null)
    try {
      await fetch('/api/whatsapp/waha-start', { method: 'POST' })
      setTimeout(async () => {
        await fetchQR()
        startPolling()
        setLoading(false)
      }, 3000)
    } catch {
      setLoading(false)
      setStatus('failed')
    }
  }

  const restartSession = async () => {
    setLoading(true)
    setStatus('connecting')
    setQr(null)
    try {
      await fetch('/api/whatsapp/waha-stop', { method: 'POST' })
      await new Promise(r => setTimeout(r, 2000))
      await fetch('/api/whatsapp/waha-start', { method: 'POST' })
      setTimeout(async () => {
        await fetchQR()
        startPolling()
        setLoading(false)
      }, 3000)
    } catch {
      setLoading(false)
      setStatus('failed')
    }
  }

  const disconnect = async () => {
    setLoading(true)
    try {
      await fetch('/api/whatsapp/waha-stop', { method: 'POST' })
      setStatus('disconnected')
      setQr(null)
      setPhone(null)
      stopPolling()
    } catch {}
    setLoading(false)
  }

  const startPolling = () => {
    stopPolling()
    let count = 0
    pollingRef.current = setInterval(async () => {
      count++
      await checkStatus()
      if (count > 40) stopPolling()
    }, 3000)
  }

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }

  useEffect(() => {
    void checkStatus()
    return () => stopPolling()
  }, [checkStatus])

  // QR expiry countdown
  useEffect(() => {
    if (qrExpiry <= 0) return
    qrTimerRef.current = setInterval(() => {
      setQrExpiry(prev => {
        if (prev <= 1) {
          if (qrTimerRef.current) clearInterval(qrTimerRef.current)
          void fetchQR()
          return 60
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (qrTimerRef.current) clearInterval(qrTimerRef.current) }
  }, [qr])

  const statusConfig = {
    loading:      { label: 'Memuat...',         color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',   dot: 'bg-gray-400' },
    connected:    { label: 'Terhubung',          color: 'bg-green-500/10 text-green-400 border-green-500/30', dot: 'bg-green-400 animate-pulse' },
    connecting:   { label: 'Menghubungkan...',   color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400 animate-pulse' },
    disconnected: { label: 'Tidak Terhubung',    color: 'bg-red-500/10 text-red-400 border-red-500/30',     dot: 'bg-red-400' },
    failed:       { label: 'Gagal — Perlu Reconnect', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
  }

  const cfg = statusConfig[status]

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-bween">
          <div>
            <h1 className="text-2xl font-bold">WhatsApp</h1>
            <p className="text-muted-foreground text-sm mt-1">Kelola koneksi WhatsApp bisnis kamu</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void checkStatus()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Cek Status
          </Button>
        </div>

        {/* Status Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'connected' ? 'bg-green-500/10' :
                  status === 'connecting' ? 'bg-yellow-500/10' :
                  status === 'failed' ? 'bg-orange-500/10' : 'bg-red-500/10'
                }`}>
                  {status === 'connected' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                   status === 'connecting' ? <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" /> :
                   status === 'failed' ? <AlertCircle className="w-5 h-5 text-orange-400" /> :
                   <WifiOff className="w-5 h-5 text-red-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Status Koneksi</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  {phone && <p className="text-xs text-muted-foreground mt-0.5">+{phone}</p>}
                  {lastChecked && <p className="text-xs text-muted-foreground mt-0.5">Terakhir dicek: {lastChecked}</p>}
                </div>
              </div>
            </div>

            {/* Connected */}
            {status === 'connected' && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => void restartSession()} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Restart Session
                </Button>
                <Button variant="destructive" size="sm" onClick={() => void disconnect()} disabled={loading}>
                  <WifiOff className="w-4 h-4 mr-1" /> Putuskan
                </Button>
              </div>
            )}

            {/* Disconnected / Failed */}
            {(status === 'disconnected' || status === 'failed') && (
              <div className="space-y-3">
                {status === 'failed' && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-400">
                    ⚠️ Session gagal — WhatsApp perlu di-scan ulang. Klik Reconnect di ba                 </div>
                )}
                <Button onClick={() => void startSession()} disabled={loading} className="w-full">
                  {loading
                    ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Memulai...</>
                    : <><Wifi className="w-4 h-4 mr-2" /> {status === 'failed' ? 'Reconnect WhatsApp' : 'Hubungkan WhatsApp'}</>
                  }
                </Button>
              </div>
            )}

            {/* QR Code */}
            {status === 'connecting' && (
              <div className="space-y-4">
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">
                  📱 Buka WhatsApp → Perangkat Tertaut → Tautkan Perangkat → Scan QR
                </div>
                <div className="flex justify-center">
                  {qr ? (
                    <div className="relative">
                      <div className="bg-white p-4 rounded-xl inline-block">
                        <img src={qr} alt="QR Code" className="w-52 h-52" />
                      </div>
                      <div className="absolute -bottom-6 left-0 right-0 text-center">
                        <span className="text-xs text-muted-foreground">
                          QR refresh dalam {qrExpiry}s
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-60 h-60 bg-muted rounded-xl flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
                      <span className="text-xs text-muted-foreground">Memuat QR...</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-6">
                  <Button variant="outline" size="sm" onClick={() => void fetchQR()} className="flex-1">
                    <QrCode className="w-4 h-4 mr-1" /> Refresh QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => void checkStatus()} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-1" /> Cek Status
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Cara Menghubungkan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              'Klik "Hubungkan WhatsApp" di atas',
              'Tunggu QR Code muncul',
              'Buka WhatsApp di HP bisnis kamu',
              'Ketuk ⋮ → Perangkat Tertaut → Tautkan Perangkat',
              'Scan QR Code yang muncul',
              'Status akan berubah jadi Terhubung otomatis',
            ].map((step, i) => (
        <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-sm text-muted-foreground">{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center">
          Menggunakan WAHA NOWEB Engine. QR auto-refresh setiap 60 detik.
          Session tersimpan selama server aktif.
        </p>

      </div>
    </DashboardLayout>
  )
}
