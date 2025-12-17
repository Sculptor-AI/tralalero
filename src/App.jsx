import { useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import { BoardProvider, useBoard } from './context/BoardContext'
import { AuthProvider } from './context/AuthContext'
import './App.css'

const BOARD_COLORS = ['coral', 'amber', 'sage', 'sky', 'violet']
const BOARD_ICONS = ['rocket', 'megaphone', 'palette', 'folder', 'star']

const initialBoards = [
  { id: 'board-1', name: 'Product Roadmap', icon: 'rocket', color: 'coral' },
  { id: 'board-2', name: 'Marketing Campaign', icon: 'megaphone', color: 'amber' },
  { id: 'board-3', name: 'Design System', icon: 'palette', color: 'sage' },
]

function AppContent() {
  const [activeBoard, setActiveBoard] = useState('board-1')
  const [boards, setBoards] = useState(initialBoards)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { initializeBoard, deleteBoard: deleteBoardData } = useBoard()

  const addBoard = useCallback((name) => {
    const newId = `board-${uuidv4()}`
    const colorIndex = boards.length % BOARD_COLORS.length
    const iconIndex = boards.length % BOARD_ICONS.length
    setBoards(prev => [...prev, {
      id: newId,
      name,
      icon: BOARD_ICONS[iconIndex],
      color: BOARD_COLORS[colorIndex]
    }])
    initializeBoard(newId)
    setActiveBoard(newId)
    return newId
  }, [boards.length, initializeBoard])

  const renameBoard = useCallback((boardId, newName) => {
    setBoards(prev => prev.map(board =>
      board.id === boardId ? { ...board, name: newName } : board
    ))
  }, [])

  const deleteBoard = useCallback((boardId) => {
    deleteBoardData(boardId)
    setBoards(prev => {
      const newBoards = prev.filter(b => b.id !== boardId)
      if (activeBoard === boardId && newBoards.length > 0) {
        setActiveBoard(newBoards[0].id)
      }
      return newBoards
    })
  }, [activeBoard, deleteBoardData])

  return (
    <div className="app">
      <Sidebar
        boards={boards}
        activeBoard={activeBoard}
        onSelectBoard={setActiveBoard}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onAddBoard={addBoard}
        onRenameBoard={renameBoard}
        onDeleteBoard={deleteBoard}
      />
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {boards.length > 0 ? (
          <Board
            boardId={activeBoard}
            boardName={boards.find(b => b.id === activeBoard)?.name}
          />
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
