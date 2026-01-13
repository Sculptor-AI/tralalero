import { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import { BoardProvider, useBoard } from './context/BoardContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

const BOARD_COLORS = ['coral', 'amber', 'sage', 'sky', 'violet']
const BOARD_ICONS = ['rocket', 'megaphone', 'palette', 'folder', 'star']

function AppContent() {
  const { isLoading: authLoading } = useAuth()
  const { boardsList, createBoard, renameBoard, deleteBoard, initializeBoard, isLoading: boardsLoading } = useBoard()
  const [activeBoard, setActiveBoard] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Set initial active board when boards list loads
  useEffect(() => {
    if (boardsList.length > 0 && !activeBoard) {
      setActiveBoard(boardsList[0].id)
    } else if (boardsList.length > 0 && !boardsList.find(b => b.id === activeBoard)) {
      // Active board was deleted, select first board
      setActiveBoard(boardsList[0].id)
    }
  }, [boardsList, activeBoard])

  const handleAddBoard = useCallback(async (name) => {
    const colorIndex = boardsList.length % BOARD_COLORS.length
    const iconIndex = boardsList.length % BOARD_ICONS.length
    try {
      const newBoard = await createBoard(name, BOARD_ICONS[iconIndex], BOARD_COLORS[colorIndex])
      setActiveBoard(newBoard.id)
    } catch (err) {
      console.error('Failed to create board:', err)
    }
  }, [boardsList.length, createBoard])

  const handleRenameBoard = useCallback(async (boardId, newName) => {
    await renameBoard(boardId, newName)
  }, [renameBoard])

  const handleDeleteBoard = useCallback(async (boardId) => {
    await deleteBoard(boardId)
  }, [deleteBoard])

  const handleSelectBoard = useCallback((boardId) => {
    setActiveBoard(boardId)
    initializeBoard(boardId)
  }, [initializeBoard])

  // Show loading state
  if (authLoading) {
    return (
      <div className="app loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <div className="logo-icon">
              <span className="logo-block logo-block-1"></span>
              <span className="logo-block logo-block-2"></span>
            </div>
          </div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar
        boards={boardsList}
        activeBoard={activeBoard}
        onSelectBoard={handleSelectBoard}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onAddBoard={handleAddBoard}
        onRenameBoard={handleRenameBoard}
        onDeleteBoard={handleDeleteBoard}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {boardsList.length > 0 && activeBoard ? (
          <Board
            boardId={activeBoard}
            boardName={boardsList.find(b => b.id === activeBoard)?.name}
          />
        ) : boardsLoading ? (
          <div className="no-boards">
            <p>Loading boards...</p>
          </div>
        ) : (
          <div className="no-boards">
            <p>No boards yet. Create one to get started!</p>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BoardProvider>
        <AppContent />
      </BoardProvider>
    </AuthProvider>
  )
}

export default App
