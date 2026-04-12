import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import http from '../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../api/apiUtils.js'

export default function BootstrapAdminPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => name.trim() && email.trim() && password.trim(), [name, email, password])

  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 p-6">
      <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-6">
        <div className="text-lg font-semibold text-zinc-900">Create initial admin</div>
        <div className="mt-1 text-sm text-zinc-600">
          This calls <span className="font-mono">POST /api/admin/create-admin</span>. Remove this endpoint in production.
        </div>

        <div className="mt-5 space-y-3">
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Name</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Password</div>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Department (optional)</div>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {success}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              disabled={!canSubmit || isSubmitting}
              onClick={async () => {
                setError('')
                setSuccess('')
                setIsSubmitting(true)
                try {
                  const res = await http.post('/api/admin/create-admin', {
                    name,
                    email,
                    password,
                    role: 'admin',
                    roleInfo: department ? { department } : {},
                  })
                  unwrapApiResponse(res)
                  setSuccess('Admin created successfully. You can now login.')
                } catch (err) {
                  setError(getErrorMessage(err))
                } finally {
                  setIsSubmitting(false)
                }
              }}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating…' : 'Create admin'}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
            >
              Back to login
            </button>
          </div>

          <div className="pt-2 text-xs text-zinc-600">
            Already have an admin?{' '}
            <Link className="text-zinc-900 underline hover:cursor-pointer" to="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
