'use client'

export const runtime = 'edge'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'CredentialsSignin'
      ? 'Email atau kata sandi salah.'
      : errorParam
      ? 'Terjadi kesalahan saat masuk. Silakan coba lagi.'
      : ''
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage('Semua bidang harus diisi.')
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (result?.error) {
        setErrorMessage('Email atau kata sandi salah atau akun tidak aktif.')
        setIsLoading(false)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setErrorMessage('Terjadi kesalahan sistem. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setErrorMessage('')
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      setErrorMessage('Gagal masuk dengan Google. Silakan coba lagi.')
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl z-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2 bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          DBSN Portal
        </h2>
        <p className="text-slate-400 text-sm">
          Masuk untuk mengakses dashboard ekosistem energi digital Anda
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-slate-300 text-sm font-medium mb-1.5">
            Alamat Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@perusahaan.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              disabled={isLoading || isGoogleLoading}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-slate-300 text-sm font-medium">
              Kata Sandi
            </label>
            <Link
              href="/lupa-kata-sandi"
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition"
              disabled={isLoading || isGoogleLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
              disabled={isLoading || isGoogleLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Masuk
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-3 text-slate-500">Atau masuk dengan</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading || isGoogleLoading}
        className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path
                  d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.9 21.56,11.47 21.35,11.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12,20.65c2.61,0 4.8,-0.87 6.4,-2.37l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.1,0.98 -3.07,0 -5.68,-2.08 -6.6,-4.88H2.03v2.66C3.65,17.7 7.55,20.65 12,20.65z"
                  fill="#34A853"
                />
                <path
                  d="M5.4,11.8c-0.23,-0.69 -0.36,-1.43 -0.36,-2.18s0.13,-1.49 0.36,-2.18V4.78H2.03C1.29,6.26 0.88,7.93 0.88,9.7s0.41,3.44 1.15,4.92L5.4,11.8z"
                  fill="#FBBC05"
                />
                <path
                  d="M12,4.35c1.42,0 2.7,0.49 3.7,1.44l2.77,-2.77C16.8,1.44 14.61,0.5 12,0.5 7.55,0.5 3.65,3.45 2.03,6.72l3.37,2.66c0.92,-2.8 3.53,-4.88 6.6,-4.88z"
                  fill="#EA4335"
                />
              </g>
            </svg>
            Google
          </>
        )}
      </button>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl z-10 flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400 text-sm">Memuat portal masuk...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
