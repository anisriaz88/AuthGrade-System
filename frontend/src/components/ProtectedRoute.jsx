import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-zinc-600">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full rounded-xl border border-zinc-200 bg-white p-6">
          <div className="text-lg font-semibold">Access denied</div>
          <div className="mt-1 text-sm text-zinc-600">
            Your account doesn’t have permission to view this page.
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
