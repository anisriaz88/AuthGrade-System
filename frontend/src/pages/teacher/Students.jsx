import { useEffect, useMemo, useState } from 'react'
import http from '../../api/http.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(
    () => selectedStudent?._id && subject.trim() && grade.trim(),
    [selectedStudent, subject, grade],
  )

  const load = async () => {
    setError('')
    setIsLoading(true)
    try {
      const res = await http.get('/api/teacher/my-students')
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
  }, [])

  return (
    <div>
      <div className="text-lg font-semibold text-zinc-900">My Students</div>
      <div className="mt-1 text-sm text-zinc-600">Students in your department.</div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-medium text-zinc-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {isLoading ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={4}>
                  Loading…
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-zinc-600" colSpan={4}>
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s._id} className="transition-colors hover:bg-zinc-50">
                  <td className="px-3 py-2 font-medium text-zinc-900">{s.name}</td>
                  <td className="px-3 py-2 text-zinc-700">{s.email}</td>
                  <td className="px-3 py-2 text-zinc-700">{s?.roleInfo?.department || '—'}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedStudent(s)
                          setSuccess('')
                        }}
                        className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-900 transition-colors hover:cursor-pointer hover:bg-zinc-50"
                      >
                        Add/Update grade
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-sm font-semibold text-zinc-900">Add / Update Grade</div>
        <div className="mt-1 text-sm text-zinc-600">
          Select a student above, then submit a subject and grade.
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm">
            <div className="text-xs text-zinc-600">Selected student</div>
            <div className="font-medium text-zinc-900">
              {selectedStudent ? `${selectedStudent.name} (${selectedStudent.email})` : '—'}
            </div>
          </div>
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Subject</div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. DBMS"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
            />
          </label>
          <label className="block">
            <div className="text-sm font-medium text-zinc-700">Grade</div>
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. A"
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500"
            />
          </label>
        </div>

        {success ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {success}
          </div>
        ) : null}

        <div className="mt-4">
          <button
            disabled={!canSubmit || isSubmitting}
            onClick={async () => {
              setError('')
              setSuccess('')
              setIsSubmitting(true)
              try {
                await http.post(`/api/teacher/grade/${selectedStudent._id}`, {
                  subject,
                  grade,
                })
                setSuccess('Grade saved successfully')
                setSubject('')
                setGrade('')
              } catch (err) {
                setError(getErrorMessage(err))
              } finally {
                setIsSubmitting(false)
              }
            }}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save grade'}
          </button>
        </div>
      </div>
    </div>
  )
}
