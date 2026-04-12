import { createBrowserRouter, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import AppShell from '../components/AppShell.jsx'

import LoginPage from '../pages/Login.jsx'
import DashboardPage from '../pages/Dashboard.jsx'
import NotFoundPage from '../pages/NotFound.jsx'

import AdminUsersPage from '../pages/admin/Users.jsx'
import AdminCreateUserPage from '../pages/admin/CreateUser.jsx'
import AdminEditUserPage from '../pages/admin/EditUser.jsx'

import TeacherStudentsPage from '../pages/teacher/Students.jsx'
import TeacherResultsPage from '../pages/teacher/Results.jsx'

import StudentGradesPage from '../pages/student/MyGrades.jsx'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },

          {
            path: '/admin/users',
            element: <ProtectedRoute roles={['admin']} />,
            children: [
              { index: true, element: <AdminUsersPage /> },
              { path: 'new', element: <AdminCreateUserPage /> },
              { path: ':id/edit', element: <AdminEditUserPage /> },
            ],
          },

          {
            path: '/teacher/students',
            element: <ProtectedRoute roles={['teacher']} />,
            children: [{ index: true, element: <TeacherStudentsPage /> }],
          },
          {
            path: '/teacher/results',
            element: <ProtectedRoute roles={['teacher']} />,
            children: [{ index: true, element: <TeacherResultsPage /> }],
          },

          {
            path: '/student/grades',
            element: <ProtectedRoute roles={['student']} />,
            children: [{ index: true, element: <StudentGradesPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
