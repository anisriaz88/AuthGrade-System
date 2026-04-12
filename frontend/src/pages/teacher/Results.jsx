import { useEffect, useMemo, useState } from 'react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function TeacherResultsPage() {
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editingGrade, setEditingGrade] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const canSave = useMemo(() => editingId && editingGrade.trim(), [editingGrade, editingId])

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

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-zinc-900">Results</div>
          <div className="mt-1 text-sm text-zinc-600">Results for students in your department.</div>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Grade</th>
              <th className="px-3 py-2">Updated</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {isLoading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={6}>
                  No results found.
                </td>
              </tr>
            ) : (
              results.map((r) => (
                <tr key={r._id} className="transition-colors hover:bg-zinc-50">
                  <td className="px-3 py-2 font-medium text-zinc-900">{r?.student?.name || '—'}</td>
                  <td className="px-3 py-2 text-zinc-700">{r?.student?.email || '—'}</td>
                  <td className="px-3 py-2 text-zinc-700">{r?.subject}</td>
                  <td className="px-3 py-2 text-zinc-700">
                    {editingId === r._id ? (
                      <input
                        value={editingGrade}
                        onChange={(e) => setEditingGrade(e.target.value)}
                        className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm outline-none transition-colors focus:border-zinc-500"
                      />
                    ) : (
                      r?.grade
                    )}
                  </td>
                  <td className="px-3 py-2 text-zinc-600">
                    {r?.updatedAt ? new Date(r.updatedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === r._id ? (
                        <>
                          <button
                            disabled={!canSave || isSaving}
                            onClick={async () => {
                              setError('')
                              setIsSaving(true)
                              try {
                                const studentId = r?.student?._id
                                if (!studentId) throw new Error('Student id missing in result')

                                await http.post(`/api/teacher/grade/${studentId}`, {
                                  subject: r.subject,
                                  grade: editingGrade,
                                })

                                setEditingId(null)
                                setEditingGrade('')
                                await load()
                              } catch (err) {
                                setError(getErrorMessage(err))
                              } finally {
                                setIsSaving(false)
                              }
                            }}
                            className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSaving ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditingGrade('')
                            }}
                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingId(r._id)
                            setEditingGrade(r?.grade || '')
                          }}
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
                        >
                          Update grade
                        </button>
                      )}
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
