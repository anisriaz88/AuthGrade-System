import { Link } from 'react-router-dom'
import { FileQuestion, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex items-center justify-center p-6 transition-colors">
      <div className="w-full max-w-md text-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <FileQuestion className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Page Not Found (404)</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The resource or page you requested does not exist or has been relocated.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-700 hover:cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Application</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
