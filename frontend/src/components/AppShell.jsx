import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Award,
  GraduationCap,
  LogOut,
  Shield,
  Building2,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'

function NavItem({ to, children, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150 hover:cursor-pointer',
          isActive
            ? 'bg-blue-600 text-white shadow-xs font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100',
        ].join(' ')
      }
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span>{children}</span>
    </NavLink>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const links = []
  links.push({
    to: '/dashboard',
    label: 'Dashboard Overview',
    icon: LayoutDashboard,
    roles: ['admin', 'teacher', 'student'],
  })
  links.push({
    to: '/admin/users',
    label: 'User Directory',
    icon: Users,
    roles: ['admin'],
  })
  links.push({
    to: '/teacher/students',
    label: 'Enrolled Students',
    icon: UserCheck,
    roles: ['teacher'],
  })
  links.push({
    to: '/teacher/results',
    label: 'Grade Management',
    icon: Award,
    roles: ['teacher'],
  })
  links.push({
    to: '/student/grades',
    label: 'Academic Transcript',
    icon: GraduationCap,
    roles: ['student'],
  })

  const visibleLinks = links.filter((l) => l.roles.includes(user?.role))

  // Role Badge Color Mapping
  const roleBadgeStyle = {
    admin: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20',
    teacher: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
    student: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  }[user?.role] || 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-2.5 sm:px-6">
          {/* Organization Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden hover:cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs font-bold">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                    AuthGrade
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                  Academic & Grading Platform
                </div>
              </div>
            </div>
          </div>

          {/* Right User Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            {toggleTheme && (
              <button
                onClick={toggleTheme}
                title="Toggle visual theme"
                className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-800 hover:cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-600" />
                )}
              </button>
            )}


            {/* Divider */}
            <div className="h-5 w-[1px] bg-slate-200 dark:border-slate-800 hidden sm:block" />

            {/* User Profile Brief */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs">
                {userInitial}
              </div>
              <div className="hidden text-left sm:block">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{user?.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${roleBadgeStyle}`}>
                    {user?.role}
                  </span>
                  {user?.role !== 'admin' && user?.roleInfo?.department && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                      • {user.roleInfo.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await logout()
                navigate('/login', { replace: true })
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar Nav (Desktop) */}
        <aside className="hidden md:block">
          <div className="sticky top-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-3 shadow-2xs">
            <nav className="mt-1 space-y-1">
              {visibleLinks.map((l) => (
                <NavItem key={l.to} to={l.to} icon={l.icon} end={l.to === '/dashboard'}>
                  {l.label}
                </NavItem>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden">
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 p-4 pt-16">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation
              </div>
              <nav className="mt-2 space-y-1">
                {visibleLinks.map((l) => (
                  <div key={l.to} onClick={() => setMobileMenuOpen(false)}>
                    <NavItem to={l.to} icon={l.icon} end={l.to === '/dashboard'}>
                      {l.label}
                    </NavItem>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-6 shadow-2xs">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
