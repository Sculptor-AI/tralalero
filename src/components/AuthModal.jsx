import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

function AuthModal({ onClose }) {
  const { login, signup, isLoading } = useAuth()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (mode === 'signup' && !name) {
      setError('Please enter your name')
      return
    }

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(name, email, password)
      }
      onClose()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="auth-modal-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <span className="auth-logo-block auth-logo-block-1"></span>
              <span className="auth-logo-block auth-logo-block-2"></span>
            </div>
          </div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p>{mode === 'login' ? 'Sign in to your account' : 'Get started with Tralalero'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? (
              <span className="auth-loading">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </span>
            ) : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button type="button" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
