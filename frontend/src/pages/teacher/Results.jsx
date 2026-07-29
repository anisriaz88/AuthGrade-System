import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  RotateCw,
  Search,
  BookOpen,
  Check,
  X,
  Edit3,
  AlertCircle,
  Calendar,
} from 'lucide-react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'
import { parseGradeAndScore, getGradeBadgeStyle, calculateGradeFromMarks } from '../../utils/gradeUtils.js'

export default function TeacherResultsPage() {
  const [results, setResults] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editingGrade, setEditingGrade] = useState('')
  const [editingScore, setEditingScore] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const canSave = useMemo(
    () => editingId && (editingGrade.trim() || editingScore.trim()),
    [editingGrade, editingScore, editingId],
  )

  const load = async () => {
    setError('')
    setIsLoading(true)
    try {
      const res = await http.get('/api/teacher/results')
      const data = unwrapApiResponse(res)
      setResults(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredResults = results.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const { grade, score } = parseGradeAndScore(r?.grade)
    return (
      r?.student?.name?.toLowerCase().includes(q) ||
      r?.student?.email?.toLowerCase().includes(q) ||
      r?.subject?.toLowerCase().includes(q) ||
      grade.toLowerCase().includes(q) ||
      score.toLowerCase().includes(q) ||
      r?.grade?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Grade Results & Evaluations</h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {filteredResults.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit evaluation records submitted for faculty students. Grade and score evaluations are displayed separately.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative w-48 sm:w-56">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
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
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Loading evaluation results…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Award className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No evaluation records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => {
                  const initial = r?.student?.name ? r.student.name.charAt(0).toUpperCase() : 'S'
                  const isEditing = editingId === r._id
                  const { grade, score } = parseGradeAndScore(r?.grade)

                  return (
                    <tr
                      key={r._id}
                      className={`transition-colors ${
                        isEditing
                          ? 'bg-blue-50/70 dark:bg-blue-950/40'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Student Account */}
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{r?.student?.name || '—'}</div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{r?.student?.email || '—'}</div>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {r?.student?.roleInfo?.semester && (
                                <span className="rounded bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.2 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                                  Sem {r.student.roleInfo.semester}
                                </span>
                              )}
                              {r?.student?.roleInfo?.batch && (
                                <span className="rounded bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                  Batch {r.student.roleInfo.batch}
                                </span>
                              )}
                              {r?.student?.roleInfo?.section && (
                                <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                                  Sec {r.student.roleInfo.section}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                          {r?.subject}
                        </span>
                      </td>

                      {/* Grade Column */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editingGrade}
                            onChange={(e) => setEditingGrade(e.target.value)}
                            placeholder="e.g. A"
                            className="w-20 rounded-md border border-blue-600 bg-white dark:bg-slate-950 px-2 py-1 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none ring-2 ring-blue-600/20"
                          />
                        ) : (
                          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-extrabold border ${getGradeBadgeStyle(grade)}`}>
                            {grade}
                          </span>
                        )}
                      </td>

                      {/* Score Column */}
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editingScore}
                            onChange={(e) => {
                              const val = e.target.value
                              setEditingScore(val)
                              const calc = calculateGradeFromMarks(val)
                              if (calc) setEditingGrade(calc)
                            }}
                            placeholder="e.g. 85"
                            className="w-24 rounded-md border border-blue-600 bg-white dark:bg-slate-950 px-2 py-1 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none ring-2 ring-blue-600/20"
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {score}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {r?.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                disabled={!canSave || isSaving}
                                onClick={async () => {
                                  setError('')
                                  setIsSaving(true)
                                  try {
                                    const studentId = r?.student?._id
                                    if (!studentId) throw new Error('Student id missing in result')

                                    let finalGradePayload = editingGrade.trim()
                                    if (editingScore.trim()) {
                                      finalGradePayload = editingGrade.trim()
                                        ? `${editingGrade.trim()} (${editingScore.trim()})`
                                        : editingScore.trim()
                                    }

                                    await http.post(`/api/teacher/grade/${studentId}`, {
                                      subject: r.subject,
                                      grade: finalGradePayload,
                                    })

                                    setEditingId(null)
                                    setEditingGrade('')
                                    setEditingScore('')
                                    await load()
                                  } catch (err) {
                                    setError(getErrorMessage(err))
                                  } finally {
                                    setIsSaving(false)
                                  }
                                }}
                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 hover:cursor-pointer disabled:opacity-50"
                              >
                                {isSaving ? (
                                  <span className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                                <span>Save</span>
                              </button>

                              <button
                                onClick={() => {
                                  setEditingId(null)
                                  setEditingGrade('')
                                  setEditingScore('')
                                }}
                                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5 text-slate-400" />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                const parsed = parseGradeAndScore(r?.grade)
                                setEditingId(r._id)
                                setEditingGrade(parsed.grade !== '—' ? parsed.grade : r?.grade || '')
                                setEditingScore(parsed.score !== '—' ? parsed.score : '')
                              }}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>
                          )}
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
