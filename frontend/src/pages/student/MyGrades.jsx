import { useEffect, useState } from 'react'
import {
  GraduationCap,
  RotateCw,
  BookOpen,
  Award,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import http from '../../api/http.js'
import { useAuth } from '../../auth/useAuth.js'
import { getErrorMessage, unwrapApiResponse } from '../../api/apiUtils.js'
import { parseGradeAndScore, getGradeBadgeStyle } from '../../utils/gradeUtils.js'

export default function StudentGradesPage() {
  const { user } = useAuth()
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

  const handleDownloadPDF = () => {
    if (!grades || grades.length === 0) return

    const doc = new jsPDF()

    // Header Branding Banner
    doc.setFillColor(30, 58, 138) // Deep Blue
    doc.rect(0, 0, 210, 30, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('AUTHGRADE ACADEMIC EVALUATION SYSTEM', 14, 16)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('OFFICIAL STUDENT ACADEMIC TRANSCRIPT & GRADE RECORD', 14, 23)

    // Student Meta Data Box
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(`Student Name: ${user?.name || 'Student'}`, 14, 40)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Email: ${user?.email || '—'}`, 14, 46)
    
    if (user?.roleInfo?.department) {
      doc.text(`Department: ${user.roleInfo.department}`, 14, 52)
    }
    if (user?.roleInfo?.section || user?.roleInfo?.batch) {
      const secStr = user?.roleInfo?.section ? `Section: ${user.roleInfo.section}` : ''
      const batchStr = user?.roleInfo?.batch ? `Batch: ${user.roleInfo.batch}` : ''
      doc.text(`${secStr}${secStr && batchStr ? ' | ' : ''}${batchStr}`, 14, 58)
    }

    const issuedDate = new Date().toLocaleString()
    doc.text(`Date Issued: ${issuedDate}`, 130, 40)
    doc.text('Status: VERIFIED & OFFICIAL', 130, 46)
    doc.text('Access Level: ENROLLED STUDENT', 130, 52)

    // Divider
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(14, 63, 196, 63)

    // Format Table Content
    const tableRows = grades.map((g, idx) => {
      const { grade: gradeTier, score: scoreVal } = parseGradeAndScore(g?.grade)
      const dateStr = g?.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : '—'
      return [
        idx + 1,
        g?.subject || '—',
        gradeTier || '—',
        scoreVal || '—',
        g?.teacher?.name || '—',
        dateStr,
      ]
    })

    autoTable(doc, {
      startY: 68,
      head: [['#', 'Subject / Course', 'Grade', 'Score / Marks', 'Faculty Evaluator', 'Date Posted']],
      body: tableRows,
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [51, 65, 85],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 55 },
        2: { cellWidth: 25, fontStyle: 'bold' },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 },
        5: { cellWidth: 22 },
      },
    })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184)
      doc.text(
        'AuthGrade System • Official Electronic Evaluation Record • Confidential',
        14,
        287
      )
      doc.text(`Page ${i} of ${pageCount}`, 180, 287)
    }

    const safeName = (user?.name || 'Student').replace(/[^a-zA-Z0-9]/g, '_')
    doc.save(`AuthGrade_Transcript_${safeName}.pdf`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Transcript & Grades</h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Official Record
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View your official evaluation grades uploaded by faculty staff. Download PDF transcript or export records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">

          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Evaluated Courses</span>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{grades.length}</div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <span>Transcript Status</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Verified & Active
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <button
            disabled={isLoading || grades.length === 0}
            onClick={handleDownloadPDF}
            title="Download PDF Transcript"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </button>
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Grades Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Lecturer</th>
                <th className="px-4 py-3 text-right">Date Posted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={5}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Loading transcript grades…</span>
                    </div>
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GraduationCap className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No grade records uploaded yet</p>
                      <p className="text-[11px] text-slate-500">Grades will appear here once submitted by your faculty staff.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                grades.map((g) => {
                  const teacherInitial = g?.teacher?.name ? g.teacher.name.charAt(0).toUpperCase() : 'T'
                  const { grade: gradeTier, score: scoreVal } = parseGradeAndScore(g?.grade)

                  return (
                    <tr key={g._id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      {/* Subject */}
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                          <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                          {g?.subject}
                        </span>
                      </td>

                      {/* Grade Column */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-extrabold border ${getGradeBadgeStyle(gradeTier)}`}>
                          {gradeTier}
                        </span>
                      </td>

                      {/* Score Column */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {scoreVal}
                        </span>
                      </td>

                      {/* Teacher */}
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {teacherInitial}
                          </div>
                          <span className="text-slate-800 dark:text-slate-200">{g?.teacher?.name || '—'}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {g?.updatedAt ? new Date(g.updatedAt).toLocaleString() : '—'}
                        </span>
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
