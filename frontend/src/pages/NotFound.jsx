import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-zinc-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6">
        <div className="text-lg font-semibold text-zinc-900">Page not found</div>
        <div className="mt-1 text-sm text-zinc-600">The page you requested doesn’t exist.</div>
        <div className="mt-4">
          <Link
            to="/"
            className="inline-flex rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
