import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    setIsLoading(true)
    try {
      const qs = roleFilter !== 'all' ? `?role=${encodeURIComponent(roleFilter)}` : ''
      const res = await http.get(`/api/admin/users${qs}`)
      const data = unwrapApiResponse(res)
      const list = Array.isArray(data) ? data : []
      setUsers(list.filter((u) => u?.role !== 'admin'))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [location.key, location.state?.refresh, roleFilter])

  const columns =
    roleFilter === 'teacher'
      ? [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'department', label: 'Department' },
          { key: 'subject', label: 'Subject' },
          { key: 'actions', label: '' },
        ]
      : roleFilter === 'student'
        ? [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'department', label: 'Department' },
            { key: 'section', label: 'Section' },
            { key: 'actions', label: '' },
          ]
        : [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'department', label: 'Department' },
            { key: 'info', label: 'Info' },
            { key: 'actions', label: '' },
          ]

  const colSpan = columns.length

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-zinc-900">Users</div>
          <div className="mt-1 text-sm text-zinc-600">Create, update, and delete users.</div>
        </div>
        <div className="flex items-center gap-3">
          <label className="block">
            <div className="sr-only">Role filter</div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-500"
            >
              <option value="all">All users</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
            </select>
          </label>

          <Link
            to="/admin/users/new"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800"
          >
            Create user
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {isLoading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={colSpan}>
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={colSpan}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="transition-colors hover:bg-zinc-50">
                  {roleFilter === 'teacher' ? (
                    <>
                      <td className="px-3 py-2 font-medium text-zinc-900">{u.name}</td>
                      <td className="px-3 py-2 text-zinc-700">{u.email}</td>
                      <td className="px-3 py-2 text-zinc-700">{u?.roleInfo?.department || '—'}</td>
                      <td className="px-3 py-2 text-zinc-700">{u?.roleInfo?.class || '—'}</td>
                    </>
                  ) : roleFilter === 'student' ? (
                    <>
                      <td className="px-3 py-2 font-medium text-zinc-900">{u.name}</td>
                      <td className="px-3 py-2 text-zinc-700">{u.email}</td>
                      <td className="px-3 py-2 text-zinc-700">{u?.roleInfo?.department || '—'}</td>
                      <td className="px-3 py-2 text-zinc-700">{u?.roleInfo?.section || '—'}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-medium text-zinc-900">{u.name}</td>
                      <td className="px-3 py-2 text-zinc-700">{u.email}</td>
                      <td className="px-3 py-2 text-zinc-700">{u.role}</td>
                      <td className="px-3 py-2 text-zinc-700">{u?.roleInfo?.department || '—'}</td>
                      <td className="px-3 py-2 text-zinc-700">
                        {u.role === 'teacher'
                          ? `Subject: ${u?.roleInfo?.class || '—'}`
                          : u.role === 'student'
                            ? `Section: ${u?.roleInfo?.section || '—'}`
                            : '—'}
                      </td>
                    </>
                  )}

                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/users/${u._id}/edit`, { state: { user: u } })}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const ok = window.confirm(`Delete ${u.name}?`)
                          if (!ok) return
                          try {
                            await http.delete(`/api/admin/users/${u._id}`)
                            await load()
                          } catch (err) {
                            setError(getErrorMessage(err))
                          }
                        }}
                        className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition-colors hover:cursor-pointer hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
