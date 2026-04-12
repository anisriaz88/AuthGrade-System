import { useEffect, useState } from 'react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function StudentGradesPage() {
  const [grades, setGrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setError('')
    setIsLoading(true)
    try {
      const res = await http.get('/api/student/my-grades')
      const data = unwrapApiResponse(res)
      setGrades(Array.isArray(data) ? data : [])
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
          <div className="text-lg font-semibold text-zinc-900">My Grades</div>
          <div className="mt-1 text-sm text-zinc-600">Your uploaded grades.</div>
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
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Grade</th>
              <th className="px-3 py-2">Teacher</th>
              <th className="px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {isLoading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : grades.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={4}>
                  No grades found.
                </td>
              </tr>
            ) : (
              grades.map((g) => (
                <tr key={g._id} className="transition-colors hover:bg-zinc-50">
                  <td className="px-3 py-2 font-medium text-zinc-900">{g?.subject}</td>
                  <td className="px-3 py-2 text-zinc-700">{g?.grade}</td>
                  <td className="px-3 py-2 text-zinc-700">{g?.teacher?.name || '—'}</td>
                  <td className="px-3 py-2 text-zinc-600">
                    {g?.updatedAt ? new Date(g.updatedAt).toLocaleString() : '—'}
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
