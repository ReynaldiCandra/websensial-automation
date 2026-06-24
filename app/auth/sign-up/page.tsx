'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { company_name: companyName },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      router.push('/auth/sign-up-success')
    } catch {
      setError('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
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
            Mulai gratis hari ini
          </h2>
          <p className="text-gray-400 text-lg max-w-sm mx-auto leading-relaxed mb-10">
            Setup dalam menit. Tidak perlu kartu kredit.
          </p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              'AI respons otomatis 24/7',
              'Dashboard sales terpusat',
              'Lead scoring otomatis',
              'Quotation & invoice generator',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
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
            <h1 className="text-2xl font-bold text-gray-900">Buat akun gratis</h1>
            <p className="text-gray-500 mt-2 text-sm">Mulai automasi sales WhatsApp Anda sekarang</p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Perusahaan</label>
              <Input
                type="text"
                placeholder="PT. Bisnis Saya"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <Input
                type="email"
                placeholder="nama@bisnis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 karakter"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              {loading ? 'Mendaftar...' : 'Buat Akun Gratis'}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              Dengan mendaftar, Anda menyetujui{' '}
              <a href="#" className="text-teal-600 hover:underline">Syarat & Ketentuan</a>
              {' '}dan{' '}
              <a href="#" className="text-teal-600 hover:underline">Kebijakan Privasi</a> kami.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-teal-600 hover:underline font-semibold">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
