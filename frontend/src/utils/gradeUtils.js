/**
 * Parses raw grade string into separate Grade (letter tier) and Score (percentage / marks)
 */
export function parseGradeAndScore(raw) {
  if (!raw || typeof raw !== 'string') {
    return { grade: '—', score: '—' }
  }

  const str = raw.trim()
  if (!str) return { grade: '—', score: '—' }

  // 1. Combined pattern e.g. "A (90%)", "A-95", "A, 88", "A (90/100)"
  const combinedMatch = str.match(/^([A-DFa-df][+-]?)\s*[\(\-,\s]\s*(\d+(?:%|\/\d+)?)\s*\)?$/i)
  if (combinedMatch) {
    const g = combinedMatch[1].toUpperCase()
    let s = combinedMatch[2]
    if (/^\d+$/.test(s)) s = `${s}`
    return { grade: g, score: s }
  }

  // 2. Pure Letter Grade pattern e.g. "A+", "A", "B-", "F"
  const letterMatch = str.match(/^([A-DFa-df][+-]?)$/i)
  if (letterMatch) {
    const g = letterMatch[1].toUpperCase()
    const scoreMap = {
      'A+': '95 - 100%',
      'A':  '85 - 94%',
      'A-': '80 - 84%',
      'B+': '77 - 79%',
      'B':  '73 - 76%',
      'B-': '70 - 72%',
      'C+': '67 - 69%',
      'C':  '63 - 66%',
      'C-': '60 - 62%',
      'D+': '57 - 59%',
      'D':  '53 - 56%',
      'D-': '50 - 52%',
      'F':  '< 50%',
    }
    return { grade: g, score: scoreMap[g] || 'Passed' }
  }

  // 3. Pure Numerical score pattern e.g. "95", "88%", "85/100"
  const numberMatch = str.match(/^(\d+)(?:%|\/100)?$/)
  if (numberMatch) {
    const num = parseInt(numberMatch[1], 10)
    let g = 'F'
    if (num >= 90) g = 'A+'
    else if (num >= 80) g = 'A'
    else if (num >= 75) g = 'B+'
    else if (num >= 70) g = 'B'
    else if (num >= 65) g = 'C+'
    else if (num >= 60) g = 'C'
    else if (num >= 50) g = 'D'

    return { grade: g, score: `${num}` }
  }

  // 4. Fallback for custom input text
  return { grade: str.toUpperCase(), score: str }
}

/**
 * Automatically calculates letter grade from numerical marks (0 - 100)
 */
export function calculateGradeFromMarks(marksInput) {
  if (marksInput === null || marksInput === undefined || marksInput === '') return ''
  const str = String(marksInput).replace(/[^0-9.]/g, '')
  if (!str) return ''
  const num = parseFloat(str)
  if (isNaN(num)) return ''
  if (num >= 90) return 'A+'
  if (num >= 80) return 'A'
  if (num >= 75) return 'B+'
  if (num >= 70) return 'B'
  if (num >= 65) return 'C+'
  if (num >= 60) return 'C'
  if (num >= 50) return 'D'
  return 'F'
}

/**
 * Returns color classes for letter grades
 */
export function getGradeBadgeStyle(gradeLetter) {
  const g = gradeLetter?.toUpperCase() || ''
  if (g.startsWith('A')) {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  }
  if (g.startsWith('B')) {
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
  }
  if (g.startsWith('C')) {
    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  }
  if (g.startsWith('D')) {
    return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
  }
  if (g.startsWith('F')) {
    return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
  }
  return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
}
