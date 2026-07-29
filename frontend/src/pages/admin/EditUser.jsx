import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, Building2, BookOpen, School, AlertCircle, CheckCircle2, User, Mail, Shield, Layers } from 'lucide-react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function AdminEditUserPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [section, setSection] = useState('')
  const [teacherAssignments, setTeacherAssignments] = useState([
    { department: '', subject: '' },
  ])
  const [batch, setBatch] = useState('')
  const [semester, setSemester] = useState('')

  const userFromState = location.state?.user

  const canSubmit = useMemo(() => name.trim() && email.trim(), [name, email])

  useEffect(() => {
    const bootstrap = async () => {
      setError('')
      setIsLoading(true)
      try {
        let user = userFromState
        if (!user || user._id !== id) {
          const res = await http.get('/api/admin/users')
          const data = unwrapApiResponse(res)
          user = Array.isArray(data) ? data.find((u) => u._id === id) : null
        }

        if (!user) {
          setError('User not found')
          return
        }

        setName(user.name || '')
        setEmail(user.email || '')
        setRole(user.role || '')
        setFaculty(user?.roleInfo?.faculty || '')
        setDepartment(user?.roleInfo?.department || '')
        setSection(user?.roleInfo?.section || '')
        setBatch(user?.roleInfo?.batch || '')
        setSemester(user?.roleInfo?.semester || '')

        const rawAssignments = user?.roleInfo?.assignments
        if (Array.isArray(rawAssignments) && rawAssignments.length > 0) {
          setTeacherAssignments(
            rawAssignments.map((a) => ({
              department: a.department || '',
              subject: a.subject || '',
              semester: a.semester || a.batch || '',
            })),
          )
        } else {
          setTeacherAssignments([
            {
              department: user?.roleInfo?.department || '',
              subject: user?.roleInfo?.class || '',
              semester: '',
            },
          ])
        }
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [id, userFromState])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-xs font-semibold text-slate-500 dark:text-slate-400 gap-2">
        <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span>Loading user account details…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Edit User Account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update account information, department, faculty, and subject assignments.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/users', { state: { refresh: Date.now() } })}
          className="self-start sm:self-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer"
        >
          Back to Directory
        </button>
      </div>

      {/* Feedback Messages */}
      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
      {success ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      ) : null}

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Sarah Connor"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@institution.edu"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
        </div>

        {/* Role (Read-only) */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            User Role
          </label>
          <div className="relative mt-1">
            <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <div className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 pl-9 pr-3.5 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 select-none">
              {role || '—'}
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">User role cannot be changed after creation.</p>
        </div>

        {/* Teacher Role Form */}
        {role === 'teacher' ? (
          <>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Faculty Name
              </label>
              <div className="relative mt-1">
                <School className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="e.g. Faculty of Computer Science & Information Technology"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Assigned Subjects, Departments & Semesters
                </label>
                <button
                  type="button"
                  onClick={() => setTeacherAssignments([...teacherAssignments, { department: '', subject: '', semester: '' }])}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:cursor-pointer transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Subject & Semester</span>
                </button>
              </div>

              {teacherAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3.5 sm:grid sm:grid-cols-11 sm:items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Department
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        value={assignment.department}
                        onChange={(e) => {
                          const updated = [...teacherAssignments]
                          updated[index].department = e.target.value
                          setTeacherAssignments(updated)
                        }}
                        placeholder="e.g. Computer Science"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Subject Name
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        value={assignment.subject}
                        onChange={(e) => {
                          const updated = [...teacherAssignments]
                          updated[index].subject = e.target.value
                          setTeacherAssignments(updated)
                        }}
                        placeholder="e.g. Data Structures"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Semester (Opt)
                    </label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        value={assignment.semester || ''}
                        onChange={(e) => {
                          const updated = [...teacherAssignments]
                          updated[index].semester = e.target.value
                          setTeacherAssignments(updated)
                        }}
                        placeholder="e.g. 5th"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      />
                    </div>
                  </div>

                  {teacherAssignments.length > 1 && (
                    <div className="sm:col-span-1 flex items-end justify-end pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => setTeacherAssignments(teacherAssignments.filter((_, i) => i !== index))}
                        title="Remove assignment"
                        className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Student Role Form */
          <>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Department
              </label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Software Engineering"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            {role === 'student' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Section
                  </label>
                  <div className="relative mt-1">
                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. A"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Batch
                  </label>
                  <div className="relative mt-1">
                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. 2022-2026"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Semester
                  </label>
                  <div className="relative mt-1">
                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. 5th"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>

      {/* Submit / Done Action Footer */}
      <div className="pt-4 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800">
        <button
          disabled={!canSubmit || isSubmitting}
          onClick={async () => {
            setError('')
            setSuccess('')
            setIsSubmitting(true)
            try {
              let finalRoleInfo = {}
              let primarySubject = ''
              if (role === 'teacher') {
                const validAssignments = teacherAssignments
                  .filter((a) => a.department.trim() && a.subject.trim())
                  .map((a) => ({
                    department: a.department.trim(),
                    subject: a.subject.trim(),
                    ...(a.semester?.trim() ? { semester: a.semester.trim() } : {}),
                  }))
                const primaryDept = validAssignments[0]?.department || department.trim()
                primarySubject = validAssignments.map((a) => a.subject).join(', ')
                const uniqueDepts = Array.from(new Set(validAssignments.map((a) => a.department)))

                finalRoleInfo = {
                  ...(faculty.trim() ? { faculty: faculty.trim() } : {}),
                  department: primaryDept,
                  departments: uniqueDepts,
                  class: primarySubject,
                  assignments: validAssignments,
                }
              } else {
                finalRoleInfo = {
                  ...(department.trim() ? { department: department.trim() } : {}),
                  ...(section.trim() ? { section: section.trim() } : {}),
                  ...(batch.trim() ? { batch: batch.trim() } : {}),
                  ...(semester.trim() ? { semester: semester.trim() } : {}),
                }
              }

              await http.put(`/api/admin/users/${id}`, {
                name,
                email,
                roleInfo: finalRoleInfo,
                ...(role === 'teacher' && primarySubject ? { subject: primarySubject } : {}),
                ...(role === 'student' && section.trim() ? { section: section.trim() } : {}),
              })
              setSuccess('User account updated successfully')
            } catch (err) {
              setError(getErrorMessage(err))
            } finally {
              setIsSubmitting(false)
            }
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          onClick={() => navigate('/admin/users', { state: { refresh: Date.now() } })}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  )
}
