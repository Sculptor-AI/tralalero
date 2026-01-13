import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { auth as authApi, setAuthToken, getAuthToken } from '../utils/api'

const AuthContext = createContext(null)

const GUEST_USER = {
  id: null,
  name: 'Guest User',
  email: '',
  avatar: null,
  isGuest: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(GUEST_USER)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const data = await authApi.me()
        setUser({
          ...data.user,
          isGuest: false,
        })
      } catch (err) {
        // Token is invalid, clear it
        setAuthToken(null)
        console.log('Session expired or invalid')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await authApi.login(email, password)
      setUser({
        ...data.user,
        isGuest: false,
      })
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (name, email, password) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await authApi.signup(name, email, password)
      setUser({
        ...data.user,
        isGuest: false,
      })
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(GUEST_USER)
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    setError(null)

    try {
      const data = await authApi.updateProfile(updates)
      setUser(prev => ({
        ...prev,
        ...data.user,
      }))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      error,
      isAuthenticated: !user.isGuest,
      login,
      signup,
      logout,
      updateProfile,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
