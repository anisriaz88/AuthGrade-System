import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UserPlus,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Building2,
  BookOpen,
  Layers,
  Shield,
  CheckCircle2,
  AlertCircle,
  School,
  Plus,
  Trash2,
} from 'lucide-react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function AdminCreateUserPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [faculty, setFaculty] = useState('')
  const [department, setDepartment] = useState('')
  const [className, setClassName] = useState('')
  const [section, setSection] = useState('')
  const [batch, setBatch] = useState('')
  const [semester, setSemester] = useState('')
  const [teacherAssignments, setTeacherAssignments] = useState([
    { department: '', subject: '' },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => {
    if (!name.trim() || !email.trim() || !password.trim() || !role.trim()) return false

    if (role === 'teacher') {
      if (!faculty.trim()) return false
      const valid = teacherAssignments.filter((a) => a.department.trim() && a.subject.trim())
      if (valid.length === 0) return false
    }
    if (role === 'student') {
      if (!department.trim() || !section.trim()) return false
    }

    return true
  }, [batch, department, email, faculty, name, password, role, section, teacherAssignments])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Create User</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Creates a new Teacher/Student account within an academic department.
          </p>
        </div>
        <Link
          to="/admin/users"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Directory</span>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-2xs space-y-6">
        {/* Step 1: Role Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Account Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all hover:cursor-pointer ${
                role === 'teacher'
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${role === 'teacher' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold capitalize">Faculty Teacher</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all hover:cursor-pointer ${
                role === 'student'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-600'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-md ${role === 'student' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold capitalize">Enrolled Student</div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Credentials */}
        <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Account Credentials
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Name of User"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="e.g. user@university.deu.com"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Scope Details */}
        <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {role === 'teacher' ? 'Faculty & Department Scope' : 'Department Scope & Assignment'}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {role === 'teacher' ? (
              <>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Faculty Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <School className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      placeholder="e.g. Faculty of Science & Information Technology"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Assigned Subjects, Departments & Semesters <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setTeacherAssignments([...teacherAssignments, { department: '', subject: '', semester: '' }])}
                      className="flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 hover:cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Subject & Semester</span>
                    </button>
                  </div>

                  {teacherAssignments.map((assignment, index) => (
                    <div
                      key={index}
                      className="flex flex-col gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 sm:grid sm:grid-cols-11 sm:items-center"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Department</label>
                        <div className="relative">
                          <Building2 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            value={assignment.department}
                            onChange={(e) => {
                              const updated = [...teacherAssignments]
                              updated[index].department = e.target.value
                              setTeacherAssignments(updated)
                            }}
                            placeholder="e.g. CS"
                            className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Subject</label>
                        <div className="relative">
                          <BookOpen className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            value={assignment.subject}
                            onChange={(e) => {
                              const updated = [...teacherAssignments]
                              updated[index].subject = e.target.value
                              setTeacherAssignments(updated)
                            }}
                            placeholder="e.g. Cyber Security"
                            className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Semester (Opt)</label>
                        <div className="relative">
                          <Layers className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            value={assignment.semester || ''}
                            onChange={(e) => {
                              const updated = [...teacherAssignments]
                              updated[index].semester = e.target.value
                              setTeacherAssignments(updated)
                            }}
                            placeholder="e.g. 5th"
                            className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>

                      {teacherAssignments.length > 1 && (
                        <div className="sm:col-span-1 flex items-end justify-end pt-1 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => setTeacherAssignments(teacherAssignments.filter((_, i) => i !== index))}
                            title="Remove assignment"
                            className="p-1.5 text-red-500 hover:text-red-700 hover:cursor-pointer"
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
              <>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. CS"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="e.g. A"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                  <label className="block mt-5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="e.g. 2022-2026"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>

                  <label className="block mt-5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Semester (Opt)
                  </label>
                  <div className="relative mt-1">
                    <Layers className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      placeholder="e.g. 5th"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
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

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-5">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 hover:cursor-pointer"
          >
            Done
          </button>
          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              setError('')
              setSuccess('')
              setIsSubmitting(true)
              try {
                let finalRoleInfo = {}
                if (role === 'teacher') {
                  const validAssignments = teacherAssignments
                    .filter((a) => a.department.trim() && a.subject.trim())
                    .map((a) => ({
                      department: a.department.trim(),
                      subject: a.subject.trim(),
                      ...(a.semester?.trim() ? { semester: a.semester.trim() } : {}),
                    }))
                  const primaryDept = validAssignments[0]?.department || ''
                  const primarySubject = validAssignments.map((a) => a.subject).join(', ')
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

                const res = await http.post('/api/admin/create-users', {
                  name,
                  email,
                  password,
                  role,
                  roleInfo: finalRoleInfo,
                })
                const data = unwrapApiResponse(res)
                setSuccess(`User created: ${data?.user?.email || email}`)
                setName('')
                setEmail('')
                setPassword('')
                setRole('student')
                setFaculty('')
                setDepartment('')
                setClassName('')
                setSection('')
                setBatch('')
                setTeacherAssignments([{ department: '', subject: '' }])

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
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Creating User…</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create User Account</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
