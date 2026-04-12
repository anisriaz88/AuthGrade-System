import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

function ActionCard({ title, description, to }) {
  return (
    <Link
      to={to}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:cursor-pointer hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <div className="mt-1 text-sm text-zinc-600">{description}</div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const items = []

  if (user?.role === 'admin') {
    items.push({
      title: 'Manage users',
      description: 'Create, edit, and delete users (admin/teacher/student).',
      to: '/admin/users',
    })
  }

  if (user?.role === 'teacher') {
    items.push({
      title: 'My students',
      description: 'View students in your department.',
      to: '/teacher/students',
    })
    items.push({
      title: 'Results',
      description: 'See results you’ve uploaded for your department.',
      to: '/teacher/results',
    })
  }

  if (user?.role === 'student') {
    items.push({
      title: 'My grades',
      description: 'View your grades uploaded by teachers.',
      to: '/student/grades',
    })
  }

  return (
    <div>
      <div className="text-lg font-semibold text-zinc-900">Dashboard</div>
      <div className="mt-1 text-sm text-zinc-600">Choose what you want to do.</div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {items.map((item) => (
          <ActionCard key={item.to} {...item} />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
        <div className="text-xs font-medium text-zinc-700">Your profile</div>
        <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-zinc-800 md:grid-cols-2">
          <div>
            <div className="text-xs text-zinc-600">Name</div>
            <div className="font-medium">{user?.name}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-600">Email</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-600">Role</div>
            <div className="font-medium">{user?.role}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-600">Department</div>
            <div className="font-medium">{user?.roleInfo?.department || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
