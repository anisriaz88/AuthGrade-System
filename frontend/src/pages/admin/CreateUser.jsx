import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function AdminCreateUserPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [department, setDepartment] = useState('')
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => {
    if (!name.trim() || !email.trim() || !password.trim() || !role.trim()) return false

    if ((role === 'teacher' || role === 'student') && !department.trim()) return false
    if (role === 'teacher' && !className.trim()) return false
    if (role === 'student' && !section.trim()) return false

    return true
  }, [className, department, email, name, password, role, section])

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-zinc-900">Create user</div>
          <div className="mt-1 text-sm text-zinc-600">Creates a new Teacher/Student Accounts.</div>
        </div>
        <Link
          to="/admin/users"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Name</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Email</div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Password</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium text-zinc-700">Role</div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
          >
            <option value="teacher">teacher</option>
            <option value="student">student</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <div className="text-sm font-medium text-zinc-700">Department</div>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. CS"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
          />
        </label>

        {role === 'teacher' ? (
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-zinc-700">Subject</div>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. cyber Security"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
            />
          </label>
        ) : null}

        {role === 'student' ? (
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-zinc-700">Section</div>
            <input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. A"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
            />
          </label>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <button
          disabled={!canSubmit || isSubmitting}
          onClick={async () => {
            setError('')
            setSuccess('')
            setIsSubmitting(true)
            try {
              const res = await http.post('/api/admin/create-users', {
                name,
                email,
                password,
                role,
                roleInfo: {
                  ...(department.trim() ? { department: department.trim() } : {}),
                  ...(role === 'teacher' ? { class: className.trim() } : {}),
                  ...(role === 'student' ? { section: section.trim() } : {}),
                },
              })
              const data = unwrapApiResponse(res)
              setSuccess(`User created: ${data?.user?.email || email}`)
              setName('')
              setEmail('')
              setPassword('')
              setRole('student')
              setDepartment('')
              setClassName('')
              setSection('')

              navigate('/admin/users', {
                replace: true,
                state: { refresh: Date.now() },
              })
            } catch (err) {
              setError(getErrorMessage(err))
            } finally {
              setIsSubmitting(false)
            }
          }}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating…' : 'Create'}
        </button>
        <button
          onClick={() => navigate('/admin/users')}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
        >
          Done
        </button>
      </div>
    </div>
  )
}
