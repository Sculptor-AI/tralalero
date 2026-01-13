import { useState } from 'react'
import UserProfile from './UserProfile'
import './Sidebar.css'

const icons = {
  rocket: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  megaphone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z"/>
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5"/>
      <circle cx="17.5" cy="10.5" r=".5"/>
      <circle cx="8.5" cy="7.5" r=".5"/>
      <circle cx="6.5" cy="12.5" r=".5"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="12" cy="5" r="1"/>
      <circle cx="12" cy="19" r="1"/>
    </svg>
  )
}

function Sidebar({ boards, activeBoard, onSelectBoard, collapsed, onToggleCollapse, onAddBoard, onRenameBoard, onDeleteBoard }) {
  const [menuOpenFor, setMenuOpenFor] = useState(null)
  const [renamingBoard, setRenamingBoard] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [isAddingBoard, setIsAddingBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')

  const handleStartRename = (board) => {
    setRenamingBoard(board.id)
    setRenameValue(board.name)
    setMenuOpenFor(null)
  }

  const handleRenameSubmit = (e) => {
    e.preventDefault()
    if (renameValue.trim() && renameValue.trim() !== boards.find(b => b.id === renamingBoard)?.name) {
      onRenameBoard(renamingBoard, renameValue.trim())
    }
    setRenamingBoard(null)
    setRenameValue('')
  }

  const handleDeleteBoard = (boardId, boardName) => {
    if (window.confirm(`Delete "${boardName}" and all its contents?`)) {
      onDeleteBoard(boardId)
    }
    setMenuOpenFor(null)
  }

  const handleAddBoard = (e) => {
    e.preventDefault()
    if (newBoardName.trim()) {
      onAddBoard(newBoardName.trim())
      setNewBoardName('')
      setIsAddingBoard(false)
    }
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <span className="logo-block logo-block-1"></span>
            <span className="logo-block logo-block-2"></span>
          </div>
          {!collapsed && <span className="logo-text">Tralalero</span>}
        </div>
        <button className="collapse-btn" onClick={onToggleCollapse} aria-label="Toggle sidebar">
          <span className={`collapse-icon ${collapsed ? 'rotated' : ''}`}>
            {icons.chevron}
          </span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {!collapsed && <span className="nav-section-label">Boards</span>}
          <div className="boards-list">
            {boards.map((board, index) => (
              <div key={board.id} className="board-item-wrapper">
                {renamingBoard === board.id ? (
                  <form onSubmit={handleRenameSubmit} className="board-rename-form">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setRenamingBoard(null)
                          setRenameValue('')
                        }
                      }}
                      className="board-rename-input"
                      autoFocus
                    />
                  </form>
                ) : (
                  <button
                    className={`nav-item board-item ${activeBoard === board.id ? 'active' : ''}`}
                    onClick={() => onSelectBoard(board.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className={`nav-icon board-icon color-${board.color}`}>
                      {icons[board.icon] || (board.icon?.length <= 2 ? board.icon : icons.folder)}
                    </span>
                    {!collapsed && <span className="nav-label">{board.name}</span>}
                    {activeBoard === board.id && <span className="active-indicator"></span>}
                  </button>
                )}
                {!collapsed && renamingBoard !== board.id && (
                  <div className="board-menu-wrapper">
                    <button
                      className="board-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenFor(menuOpenFor === board.id ? null : board.id)
                      }}
                    >
                      {icons.more}
                    </button>
                    {menuOpenFor === board.id && (
                      <div className="board-menu">
                        <button
                          className="board-menu-item"
                          onClick={() => handleStartRename(board)}
                        >
                          {icons.edit}
                          Rename
                        </button>
                        <button
                          className="board-menu-item delete"
                          onClick={() => handleDeleteBoard(board.id, board.name)}
                        >
                          {icons.trash}
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {!collapsed && (
            isAddingBoard ? (
              <form onSubmit={handleAddBoard} className="add-board-form">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name..."
                  className="add-board-input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsAddingBoard(false)
                      setNewBoardName('')
                    }
                  }}
                />
                <div className="add-board-actions">
                  <button type="submit" className="add-board-submit">Add</button>
                  <button
                    type="button"
                    className="add-board-cancel"
                    onClick={() => {
                      setIsAddingBoard(false)
                      setNewBoardName('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="nav-item add-board-btn"
                onClick={() => setIsAddingBoard(true)}
              >
                <span className="nav-icon">{icons.plus}</span>
                <span className="nav-label">New Board</span>
              </button>
            )
          )}
        </div>
      </nav>

      <UserProfile collapsed={collapsed} />
    </aside>
  )
}

export default Sidebar
