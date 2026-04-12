import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import http from '../api/http.js'
import { clearStoredAuth, getStoredAuth, setStoredAuth } from './authStorage.js'
import { getErrorMessage, unwrapApiResponse } from '../api/apiUtils.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const stored = getStoredAuth()
    if (stored) {
      setUser(stored.user)
      setAccessToken(stored.accessToken)
    }
    setIsBootstrapping(false)
  }, [])

  const isAuthenticated = !!user && !!accessToken

  const login = useCallback(async ({ email, password }) => {
    try {
      const res = await http.post('/api/auth/login', { email, password })
      const data = unwrapApiResponse(res)
      const nextAuth = { user: data.user, accessToken: data.accessToken }
      setUser(nextAuth.user)
      setAccessToken(nextAuth.accessToken)
      setStoredAuth(nextAuth)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await http.post('/api/auth/logout')
    } finally {
      setUser(null)
      setAccessToken(null)
      clearStoredAuth()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      isBootstrapping,
      login,
      logout,
      setAuth: ({ user: nextUser, accessToken: nextToken }) => {
        setUser(nextUser)
        setAccessToken(nextToken)
        setStoredAuth({ user: nextUser, accessToken: nextToken })
      },
      clearAuth: () => {
        setUser(null)
        setAccessToken(null)
        clearStoredAuth()
      },
    }),
    [accessToken, isAuthenticated, isBootstrapping, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
