import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'block rounded-lg px-3 py-2 text-sm transition-colors hover:cursor-pointer',
          isActive
            ? 'bg-zinc-900 text-white'
            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const links = []
  links.push({ to: '/dashboard', label: 'Dashboard', roles: ['admin', 'teacher', 'student'] })
  links.push({ to: '/admin/users', label: 'Users', roles: ['admin'] })
  links.push({ to: '/teacher/students', label: 'My Students', roles: ['teacher'] })
  links.push({ to: '/teacher/results', label: 'Results', roles: ['teacher'] })
  links.push({ to: '/student/grades', label: 'My Grades', roles: ['student'] })

  const visibleLinks = links.filter((l) => l.roles.includes(user?.role))

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-base font-semibold text-zinc-900">AuthGrade</div>
            <div className="text-xs text-zinc-600">
              Signed in as {user?.name} ({user?.role})
            </div>
          </div>
          <button
            onClick={async () => {
              await logout()
              navigate('/login', { replace: true })
            }}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-zinc-800"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-zinc-200 bg-white p-3">
          <nav className="space-y-1">
            {visibleLinks.map((l) => (
              <NavItem key={l.to} to={l.to} end={l.to === '/dashboard'}>
                {l.label}
              </NavItem>
            ))}
          </nav>
        </aside>

        <main className="rounded-xl border border-zinc-200 bg-white p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
