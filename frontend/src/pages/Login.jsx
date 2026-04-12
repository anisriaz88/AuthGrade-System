import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password])

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-4 py-10 md:grid-cols-2">
        <div>
          <div className="text-3xl font-semibold text-zinc-900">AuthGrade</div>
          <div className="mt-2 text-sm text-zinc-600">
            Sign in to access Admin, Teacher, or Student features.
          </div>
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
            <div className="text-base font-semibold text-zinc-900">Login</div>
            <div className="mt-4 space-y-3">
              <label className="block">
                <div className="text-sm font-medium text-zinc-700">Email</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
                />
              </label>
              <label className="block">
                <div className="text-sm font-medium text-zinc-700">Password</div>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
                />
              </label>

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                disabled={!canSubmit || isSubmitting}
                onClick={async (e) => {
                  e.preventDefault()
                  setError('')
                  setIsSubmitting(true)
                  const res = await login({ email, password })
                  setIsSubmitting(false)
                  if (!res.ok) {
                    setError(res.message)
                    return
                  }
                  navigate('/dashboard', { replace: true })
                }}
                className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:block" />
      </div>
    </div>
  )
}
