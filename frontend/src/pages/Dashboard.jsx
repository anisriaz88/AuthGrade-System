import { Link } from 'react-router-dom'
import {
  Users,
  UserCheck,
  Award,
  GraduationCap,
  ChevronRight,
  User,
  Mail,
  Shield,
  Building2,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth.js'

function ActionCard({ title, description, to, icon: IconComponent, badgeColor }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${badgeColor || 'bg-blue-600'} text-white shadow-xs transition-transform group-hover:scale-105`}>
          {IconComponent ? <IconComponent className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <div className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const items = []

  if (user?.role === 'admin') {
    items.push({
      title: 'Manage users',
      description: 'Create, edit, search, and delete system accounts (admin/teacher/student).',
      to: '/admin/users',
      icon: Users,
      badgeColor: 'bg-gradient-to-tr from-purple-600 to-indigo-600',
    })
  }

  if (user?.role === 'teacher') {
    items.push({
      title: 'My students',
      description: 'View enrolled students in your assigned academic department.',
      to: '/teacher/students',
      icon: UserCheck,
      badgeColor: 'bg-gradient-to-tr from-indigo-600 to-blue-600',
    })
    items.push({
      title: 'Results',
      description: 'View and upload evaluation scores for department students.',
      to: '/teacher/results',
      icon: Award,
      badgeColor: 'bg-gradient-to-tr from-amber-600 to-indigo-600',
    })
  }

  if (user?.role === 'student') {
    items.push({
      title: 'My grades',
      description: 'View transcript evaluation scores uploaded by department faculty.',
      to: '/student/grades',
      icon: GraduationCap,
      badgeColor: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
    })
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Banner Header */}
      <div className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white capitalize">
                {user?.role === 'admin'
                  ? 'Admin Portal'
                  : user?.role === 'teacher'
                  ? 'Teacher Portal'
                  : user?.role === 'student'
                  ? 'Student Portal'
                  : 'System Dashboard'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Welcome, <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
            </p>
          </div>
        </div>

        {/* Role Portal Banner Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg text-white shadow-xs ${
                user?.role === 'admin'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                  : user?.role === 'teacher'
                  ? 'bg-gradient-to-tr from-indigo-600 to-blue-600'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
              }`}>
                {user?.role === 'admin' ? (
                  <Shield className="h-6 w-6" />
                ) : user?.role === 'teacher' ? (
                  <UserCheck className="h-6 w-6" />
                ) : (
                  <GraduationCap className="h-6 w-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight capitalize">
                    {user?.role === 'admin'
                      ? 'Admin Portal'
                      : user?.role === 'teacher'
                      ? 'Teacher Portal'
                      : user?.role === 'student'
                      ? 'Student Portal'
                      : 'User Portal'}
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {user?.role === 'admin' && 'System-wide administrative panel for user directory management and access control.'}
                  {user?.role === 'teacher' && 'Faculty management portal for reviewing enrolled department students and grade results.'}
                  {user?.role === 'student' && 'Academic student portal for viewing official transcript evaluations and course results.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modules Grid */}
      <div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <ActionCard key={item.to} {...item} />
          ))}
        </div>
      </div>

      {/* Account Overview Box */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <User className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Your Profile Overview</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
            ID: {user?._id?.slice(-8) || 'ACTIVE'}
          </span>
        </div>

        <div className={`mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 ${user?.role === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Full Name</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Email</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.email}</div>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              <span>Role</span>
            </div>
            <div className="mt-1 inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider border border-blue-500/20">
              {user?.role}
            </div>
          </div>

          {user?.role !== 'admin' && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{user?.role === 'teacher' ? 'Faculty' : 'Department'}</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.roleInfo?.department || '—'}
              </div>
            </div>
          )}

          {user?.role === 'teacher' && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                <span>Assigned Subject</span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user?.subject || user?.roleInfo?.class || '—'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
