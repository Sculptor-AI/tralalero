import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const DEFAULT_USER = {
  id: 'user-1',
  name: 'Guest User',
  email: '',
  avatar: null,
  isGuest: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    // For demo purposes, accept any email/password
    setUser({
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      avatar: null,
      isGuest: false,
    })
    setIsLoading(false)
    return { success: true }
  }, [])

  const signup = useCallback(async (name, email, password) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    setUser({
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: null,
      isGuest: false,
    })
    setIsLoading(false)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(DEFAULT_USER)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !user.isGuest,
      login,
      signup,
      logout,
      updateProfile,
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
