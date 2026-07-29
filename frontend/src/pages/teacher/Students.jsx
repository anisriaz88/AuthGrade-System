import { useEffect, useMemo, useState } from 'react'
import {
  UserCheck,
  Search,
  Building2,
  Award,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Layers,
  ChevronDown,
} from 'lucide-react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'
import { calculateGradeFromMarks } from '../../utils/gradeUtils.js'
import { useAuth } from '../../auth/useAuth.js'

export default function TeacherStudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [score, setScore] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  // Extract all assigned subject-department pairs from teacher's roleInfo
  const assignmentsList = useMemo(() => {
    const raw = user?.roleInfo?.assignments
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.filter((a) => a.subject && a.department)
    }
    if (user?.roleInfo?.class || user?.subject || user?.roleInfo?.department) {
      return [
        {
          subject: user?.roleInfo?.class || user?.subject || 'General Evaluation',
          department: user?.roleInfo?.department || '',
          semester: user?.roleInfo?.semester || '',
          batch: user?.roleInfo?.batch || '',
        },
      ]
    }
    return []
  }, [user])

  const activeAssignment = useMemo(() => {
    return assignmentsList[selectedIndex] || assignmentsList[0] || { subject: '', department: '' }
  }, [assignmentsList, selectedIndex])

  // Sync subject state whenever active assignment changes
  useEffect(() => {
    if (activeAssignment?.subject) {
      setSubject(activeAssignment.subject)
    }
  }, [activeAssignment])

  const canSubmit = useMemo(
    () => selectedStudent?._id && subject.trim() && (grade.trim() || score.trim()),
    [selectedStudent, subject, grade, score],
  )

  const load = async () => {
    setError('')
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeAssignment?.department) params.append('department', activeAssignment.department)
      if (activeAssignment?.semester) params.append('semester', activeAssignment.semester)
      if (activeAssignment?.batch) params.append('batch', activeAssignment.batch)
      if (activeAssignment?.section) params.append('section', activeAssignment.section)

      const queryString = params.toString()
      const url = queryString ? `/api/teacher/my-students?${queryString}` : '/api/teacher/my-students'
      const res = await http.get(url)
      const data = unwrapApiResponse(res)
      setStudents(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [activeAssignment?.department, activeAssignment?.semester, activeAssignment?.batch, activeAssignment?.section])

  // Client-side filter matching active department, semester/batch, and search query
  const departmentStudents = useMemo(() => {
    if (!activeAssignment?.department) return students
    const targetDept = activeAssignment.department.toLowerCase().trim()
    const targetSemester = activeAssignment.semester ? activeAssignment.semester.toLowerCase().trim() : null
    const targetBatch = activeAssignment.batch ? activeAssignment.batch.toLowerCase().trim() : null
    const targetSection = activeAssignment.section ? activeAssignment.section.toLowerCase().trim() : null

    return students.filter((s) => {
      const matchesDept = s?.roleInfo?.department?.toLowerCase().trim() === targetDept
      const matchesSem = targetSemester ? s?.roleInfo?.semester?.toLowerCase().trim() === targetSemester : true
      const matchesBatch = targetBatch ? s?.roleInfo?.batch?.toLowerCase().trim() === targetBatch : true
      const matchesSection = targetSection ? s?.roleInfo?.section?.toLowerCase().trim() === targetSection : true
      return matchesDept && matchesSem && matchesBatch && matchesSection
    })
  }, [students, activeAssignment])

  const filteredStudents = departmentStudents.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      s?.name?.toLowerCase().includes(q) ||
      s?.email?.toLowerCase().includes(q) ||
      s?.roleInfo?.section?.toLowerCase().includes(q) ||
      s?.roleInfo?.semester?.toLowerCase().includes(q) ||
      s?.roleInfo?.batch?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Student Roster & Grading</h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {filteredStudents.length} Students
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select an assigned subject to automatically load enrolled students by department and semester.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-56">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
          />
        </div>
      </div>

      {/* Primary Subject Selection Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-xs shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Assigned Subject
                </label>
                {activeAssignment?.department && (
                  <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                    Dept: {activeAssignment.department}
                  </span>
                )}
                {activeAssignment?.semester && (
                  <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                    Sem: {activeAssignment.semester}
                  </span>
                )}
                {activeAssignment?.batch && !activeAssignment?.semester && (
                  <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                    Batch: {activeAssignment.batch}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choosing a subject automatically selects its target department & semester to load students.
              </div>
            </div>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedIndex}
              onChange={(e) => {
                const idx = Number(e.target.value)
                setSelectedIndex(idx)
                setSelectedStudent(null)
                setSuccess('')
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 hover:cursor-pointer"
            >
              {assignmentsList.length === 0 ? (
                <option value={0}>No subjects assigned</option>
              ) : (
                assignmentsList.map((a, idx) => (
                  <option key={idx} value={idx}>
                    {a.subject} ({a.department}{a.semester ? ` • Sem ${a.semester}` : a.batch ? ` • Batch ${a.batch}` : ''})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Semester / Batch / Section</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Fetching students for {activeAssignment.department || 'department'}…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserCheck className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No students enrolled in {activeAssignment.department || 'this department'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Try selecting another subject or checking department assignments.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const initial = s?.name ? s.name.charAt(0).toUpperCase() : 'S'
                  const isSelected = selectedStudent?._id === s._id

                  return (
                    <tr
                      key={s._id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 font-semibold'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
                            {initial}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">{s.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          {s?.roleInfo?.department || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {s?.roleInfo?.semester && (
                            <span className="rounded-md bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                              Sem {s.roleInfo.semester}
                            </span>
                          )}
                          {s?.roleInfo?.batch && (
                            <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                              Batch {s.roleInfo.batch}
                            </span>
                          )}
                          {s?.roleInfo?.section && (
                            <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              Sec {s.roleInfo.section}
                            </span>
                          )}
                          {!s?.roleInfo?.semester && !s?.roleInfo?.batch && !s?.roleInfo?.section && '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(s)
                            setSuccess('')
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.2 text-xs font-semibold transition-all hover:cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span>{isSelected ? 'Selected' : 'Add/Update grade'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grade & Score Entry Form Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Award className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Add / Update Student Grade & Score</span>
          </div>
          {selectedStudent && (
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Target: {selectedStudent.name}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select a student from the roster above to enter marks and save their evaluation for <strong className="text-slate-800 dark:text-slate-200">{activeAssignment.subject}</strong>.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Selected Student</div>
            <div className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {selectedStudent ? selectedStudent.name : 'No student selected'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Assigned Subject <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                value={subject}
                readOnly
                disabled
                title="Subject is locked to your currently selected assignment"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 outline-none cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Marks <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <input
                value={score}
                onChange={(e) => {
                  const val = e.target.value
                  setScore(val)
                  const calc = calculateGradeFromMarks(val)
                  if (calc) setGrade(calc)
                }}
                placeholder="e.g 85"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-4 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Grade <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Auto-calculated (e.g. A)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 pl-9 pr-3 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
          </div>
        </div>

        {success ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        ) : null}

        <div className="pt-2 flex justify-end">
          <button
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              setError('')
              setSuccess('')
              setIsSubmitting(true)
              try {
                let finalPayload = grade.trim()
                if (score.trim()) {
                  finalPayload = grade.trim() ? `${grade.trim()} (${score.trim()})` : score.trim()
                }

                await http.post(`/api/teacher/grade/${selectedStudent._id}`, {
                  subject,
                  grade: finalPayload,
                })
                setSuccess(`Grade and score saved successfully for ${selectedStudent?.name || 'student'}`)
                setSelectedStudent(null)
                setGrade('')
                setScore('')
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
                <span>Saving Grade & Score…</span>
              </>
            ) : (
              <>
                <Award className="h-4 w-4" />
                <span>Save Evaluation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
