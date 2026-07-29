import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Building2,
  Shield,
  BookOpen,
  Layers,
  AlertCircle,
  CheckCircle2,
  School,
} from 'lucide-react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function AdminUsersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
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

  // Filter list by search query client-side for immediate feedback
  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const assignmentsStr = Array.isArray(u?.roleInfo?.assignments)
      ? u.roleInfo.assignments.map((a) => `${a.department} ${a.subject}`).join(' ')
      : ''
    return (
      u?.name?.toLowerCase().includes(q) ||
      u?.email?.toLowerCase().includes(q) ||
      u?.roleInfo?.department?.toLowerCase().includes(q) ||
      u?.roleInfo?.faculty?.toLowerCase().includes(q) ||
      u?.roleInfo?.class?.toLowerCase().includes(q) ||
      u?.roleInfo?.section?.toLowerCase().includes(q) ||
      u?.roleInfo?.batch?.toLowerCase().includes(q) ||
      assignmentsStr.toLowerCase().includes(q)
    )
  })

  const columns =
    roleFilter === 'teacher'
      ? [
        { key: 'name', label: 'User Account' },
        { key: 'faculty', label: 'Faculty' },
        { key: 'department', label: 'Department' },
        { key: 'subject', label: 'Subjects' },
        { key: 'actions', label: 'Actions' },
      ]
      : roleFilter === 'student'
        ? [
          { key: 'name', label: 'User Account' },
          { key: 'department', label: 'Department' },
          { key: 'section', label: 'Section' },
          { key: 'batch', label: 'Batch' },
          { key: 'actions', label: 'Actions' },
        ]
        : [
          { key: 'name', label: 'User Account' },
          { key: 'role', label: 'Role' },
          { key: 'faculty', label: 'Faculty' },
          { key: 'department', label: 'Department' },
          { key: 'section', label: 'Section' },
          { key: 'actions', label: 'Actions' },
        ]

  const colSpan = columns.length

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'teacher':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
      case 'student':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
      default:
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">User Directory</h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {filteredUsers.length} Users
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage institutional user accounts, role assignments, and permissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative w-56 sm:w-72">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user, email, department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-600 hover:cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
            </select>
          </div>

          {/* Create User Button */}
          <Link
            to="/admin/users/new"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 hover:cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create User</span>
          </Link>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Enterprise Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                {columns.map((c, i) => (
                  <th
                    key={c.key}
                    className={`px-5 py-3.5 ${i === columns.length - 1 ? 'text-right' : ''} ${c.key === 'role' || c.key === 'section' ? 'pl-8' : ''}`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={colSpan}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Fetching user directory records…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-400" colSpan={colSpan}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No users match your criteria</p>
                      <p className="text-[11px] text-slate-500">Try adjusting your role filter or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initial = u?.name ? u.name.charAt(0).toUpperCase() : 'U'
                  return (
                    <tr
                      key={u._id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{u.name}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Columns by Role Filter */}
                      {roleFilter === 'teacher' ? (
                        <>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <School className="h-3.5 w-3.5 text-slate-400" />
                              {u?.roleInfo?.faculty || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              {Array.isArray(u?.roleInfo?.assignments) && u.roleInfo.assignments.length > 0
                                ? Array.from(new Set(u.roleInfo.assignments.map((a) => a.department).filter(Boolean))).join(', ')
                                : u?.roleInfo?.department || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium">
                            {Array.isArray(u?.roleInfo?.assignments) && u.roleInfo.assignments.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.roleInfo.assignments.map((a, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                                  >
                                    {a.subject} ({a.department}{a.semester ? ` • ${a.semester}` : a.batch ? ` • ${a.batch}` : ''})
                                  </span>
                                ))}
                              </div>
                            ) : u?.roleInfo?.class ? (
                              <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                {u.roleInfo.class}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </>
                      ) : roleFilter === 'student' ? (
                        <>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              {u?.roleInfo?.department || '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium">
                            {u?.roleInfo?.section ? (
                              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                Section {u.roleInfo.section}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-5 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                            {u?.roleInfo?.batch || '—'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5 ">
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(u.role)}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex ml-2 items-center gap-1 text-slate-700 dark:text-slate-300">
                              {u.role === 'teacher' ? (u?.roleInfo?.faculty || '—') : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex ml-5 items-center gap-1 text-slate-700 dark:text-slate-300">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              {u.role === 'admin' ? '—' : (u?.roleInfo?.department || '—')}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-medium">
                            {u.role === 'student' && u?.roleInfo?.section ? (
                              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                Section {u.roleInfo.section}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </>
                      )}

                      {/* Actions Column */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/users/${u._id}/edit`, { state: { user: u } })}
                            title="Edit user"
                            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
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
                            title="Delete user"
                            className="flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-red-900/60 hover:cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
