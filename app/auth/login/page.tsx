'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-gray-900"></div>
        <div className="relative z-10 text-center">
          <Image
            src="/websensial-logo-tech.png"
            alt="Websensial"
            width={240}
            height={64}
            className="h-16 w-auto object-contain mx-auto"
          />
          <h2 className="text-3xl font-bold text-white mb-4">
            Selamat datang kembali
          </h2>
          <p className="text-gray-400 text-lg max-w-sm mx-auto leading-relaxed">
            Kelola semua percakapan WhatsApp dan sales pipeline Anda dari satu dashboard.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { val: '500+', label: 'Bisnis aktif' },
              { val: '+60%', label: 'Closing rate' },
              { val: '24/7', label: 'AI aktif' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-teal-400">{s.val}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Image
              src="/websensial-logo-teal.png"
            alt="Websensial"
            width={220}
            height={60}
            className="h-14 w-auto object-contain mx-auto"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Masuk ke akun Anda</h1>
            <p className="text-gray-500 mt-2 text-sm">Masukkan email dan password untuk melanjutkan</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nama@bisnis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs text-teal-600 hover:underline">Lupa password?</a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold mt-2"
            >
              {loading ? 'Sedang masuk...' : 'Masuk'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link href="/auth/sign-up" className="text-teal-600 hover:underline font-semibold">
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
