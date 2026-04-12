import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function AdminEditUserPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')

  const userFromState = location.state?.user

  const canSubmit = useMemo(() => name.trim() && email.trim(), [name, email])

  useEffect(() => {
    const bootstrap = async () => {
      setError('')
      setIsLoading(true)
      try {
        if (userFromState?._id === id) {
          setName(userFromState.name || '')
          setEmail(userFromState.email || '')
          setRole(userFromState.role || '')
          setDepartment(userFromState?.roleInfo?.department || '')
          setClassName(userFromState?.roleInfo?.class || '')
          setSection(userFromState?.roleInfo?.section || '')
          return
        }

        const res = await http.get('/api/admin/users')
        const data = unwrapApiResponse(res)
        const found = Array.isArray(data) ? data.find((u) => u._id === id) : null
        if (!found) {
          setError('User not found')
          return
        }
        setName(found.name || '')
        setEmail(found.email || '')
        setRole(found.role || '')
        setDepartment(found?.roleInfo?.department || '')
        setClassName(found?.roleInfo?.class || '')
        setSection(found?.roleInfo?.section || '')
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [id, userFromState])

  if (isLoading) {
    return <div className="text-sm text-zinc-600">Loading…</div>
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-zinc-900">Edit user</div>
          <div className="mt-1 text-sm text-zinc-600">Updates name/email/roleInfo only (role can’t be changed here).</div>
        </div>
        <Link
          to="/admin/users"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
        >
          Back
        </Link>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
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
        <label className="block md:col-span-2">
          <div className="text-sm font-medium text-zinc-700">Role</div>
          <div className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
            {role || '—'}
          </div>
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-medium text-zinc-700">Department</div>
          <input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
          />
        </label>

        {role === 'teacher' ? (
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-zinc-700">Class</div>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            />
          </label>
        ) : null}

        {role === 'student' ? (
          <label className="block md:col-span-2">
            <div className="text-sm font-medium text-zinc-700">Section</div>
            <input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            />
          </label>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          disabled={!canSubmit}
          onClick={async () => {
            setError('')
            setSuccess('')
            try {
              await http.put(`/api/admin/users/${id}`, {
                name,
                email,
                roleInfo: {
                  ...(department.trim() ? { department: department.trim() } : {}),
                  ...(role === 'teacher' ? { class: className.trim() } : {}),
                  ...(role === 'student' ? { section: section.trim() } : {}),
                },
              })
              setSuccess('User updated successfully')
            } catch (err) {
              setError(getErrorMessage(err))
            }
          }}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save
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
