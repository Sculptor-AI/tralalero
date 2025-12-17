import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import './UserProfile.css'

function UserProfile({ collapsed }) {
  const { user, isAuthenticated, logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = ['coral', 'amber', 'sage', 'sky', 'violet']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <>
      <div className="user-profile-wrapper">
        <button
          className={`user-profile ${collapsed ? 'collapsed' : ''}`}
          onClick={() => isAuthenticated ? setShowMenu(!showMenu) : setShowAuthModal(true)}
        >
          <div className={`user-avatar color-${getAvatarColor(user.name)}`}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span>{getInitials(user.name)}</span>
            )}
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-status">
                {isAuthenticated ? user.email : 'Click to sign in'}
              </span>
            </div>
          )}
        </button>

        {showMenu && isAuthenticated && (
          <div className="user-menu">
            <div className="user-menu-header">
              <div className={`user-avatar color-${getAvatarColor(user.name)}`}>
                {getInitials(user.name)}
              </div>
              <div className="user-menu-info">
                <span className="user-menu-name">{user.name}</span>
                <span className="user-menu-email">{user.email}</span>
              </div>
            </div>
            <div className="user-menu-divider" />
            <button className="user-menu-item" onClick={() => setShowMenu(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profile
            </button>
            <button className="user-menu-item" onClick={() => setShowMenu(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </button>
            <div className="user-menu-divider" />
            <button
              className="user-menu-item logout"
              onClick={() => {
                logout()
                setShowMenu(false)
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  )
}

export default UserProfile
