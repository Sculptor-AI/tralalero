import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { boards as boardsApi, columns as columnsApi, cards as cardsApi, getAuthToken } from '../utils/api'
import { useAuth } from './AuthContext'

const BoardContext = createContext(null)

// Default data for guests (not logged in)
const guestData = {
  'board-1': {
    columns: [
      {
        id: 'col-1',
        title: 'Backlog',
        cards: [
          { id: 'card-1', title: 'Research competitor features', description: 'Analyze top 5 competitors', labels: ['research'], priority: 'medium' },
          { id: 'card-2', title: 'User interview synthesis', description: 'Compile insights from 12 user interviews', labels: ['research', 'ux'], priority: 'high' },
          { id: 'card-3', title: 'Define MVP scope', description: '', labels: ['planning'], priority: 'high' },
        ]
      },
      {
        id: 'col-2',
        title: 'To Do',
        cards: [
          { id: 'card-4', title: 'Design system audit', description: 'Review current components for consistency', labels: ['design'], priority: 'medium' },
          { id: 'card-5', title: 'API documentation', description: 'Document all REST endpoints', labels: ['dev', 'docs'], priority: 'low' },
        ]
      },
      {
        id: 'col-3',
        title: 'In Progress',
        cards: [
          { id: 'card-6', title: 'Dashboard redesign', description: 'New layout with improved data visualization', labels: ['design', 'ux'], priority: 'high' },
          { id: 'card-7', title: 'Authentication flow', description: 'Implement OAuth2 with Google and GitHub', labels: ['dev'], priority: 'high' },
        ]
      },
      {
        id: 'col-4',
        title: 'Review',
        cards: [
          { id: 'card-8', title: 'Onboarding experience', description: 'New user onboarding with guided tour', labels: ['ux', 'dev'], priority: 'medium' },
        ]
      },
      {
        id: 'col-5',
        title: 'Done',
        cards: [
          { id: 'card-9', title: 'Project setup', description: 'Initialize repository and CI/CD', labels: ['dev'], priority: 'low' },
          { id: 'card-10', title: 'Brand guidelines', description: 'Colors, typography, and logo usage', labels: ['design'], priority: 'medium' },
        ]
      }
    ]
  },
  'board-2': {
    columns: [
      { id: 'col-m1', title: 'Ideas', cards: [{ id: 'card-m1', title: 'Social media campaign', description: 'Q1 launch campaign', labels: ['social'], priority: 'high' }] },
      { id: 'col-m2', title: 'Planning', cards: [] },
      { id: 'col-m3', title: 'In Progress', cards: [] },
      { id: 'col-m4', title: 'Complete', cards: [] },
    ]
  },
  'board-3': {
    columns: [
      { id: 'col-d1', title: 'Components', cards: [{ id: 'card-d1', title: 'Button variants', description: 'Primary, secondary, ghost', labels: ['component'], priority: 'medium' }] },
      { id: 'col-d2', title: 'In Development', cards: [] },
      { id: 'col-d3', title: 'Testing', cards: [] },
      { id: 'col-d4', title: 'Released', cards: [] },
    ]
  }
}

export function BoardProvider({ children }) {
  const { isAuthenticated, user } = useAuth()
  const [boardData, setBoardData] = useState({})
  const [boardsList, setBoardsList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load boards when user authenticates
  useEffect(() => {
    if (isAuthenticated && getAuthToken()) {
      loadBoards()
    } else {
      // Use guest data when not authenticated
      setBoardData(guestData)
      setBoardsList([
        { id: 'board-1', name: 'Product Roadmap', icon: '🚀', color: 'sky' },
        { id: 'board-2', name: 'Marketing Campaign', icon: '📣', color: 'coral' },
        { id: 'board-3', name: 'Design System', icon: '🎨', color: 'violet' },
      ])
    }
  }, [isAuthenticated])

  const loadBoards = async () => {
    setIsLoading(true)
    try {
      const data = await boardsApi.list()
      setBoardsList(data.boards || [])
    } catch (err) {
      console.error('Failed to load boards:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBoard = async (boardId) => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const data = await boardsApi.get(boardId)
      setBoardData(prev => ({
        ...prev,
        [boardId]: {
          columns: data.columns || []
        }
      }))
    } catch (err) {
      console.error('Failed to load board:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const moveCard = useCallback(async (boardId, sourceColId, destColId, sourceIndex, destIndex) => {
    // Get card before optimistic update
    const board = boardData[boardId]
    const sourceCol = board?.columns.find(c => c.id === sourceColId)
    const card = sourceCol?.cards[sourceIndex]

    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = JSON.parse(JSON.stringify(board.columns))
      const sourceCol = newColumns.find(c => c.id === sourceColId)
      const destCol = newColumns.find(c => c.id === destColId)

      if (!sourceCol || !destCol) return prev

      const [movedCard] = sourceCol.cards.splice(sourceIndex, 1)
      destCol.cards.splice(destIndex, 0, movedCard)

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken() && card) {
      try {
        await cardsApi.move(card.id, sourceColId, destColId, destIndex)
      } catch (err) {
        console.error('Failed to move card:', err)
        // Reload board to sync state
        loadBoard(boardId)
      }
    }
  }, [isAuthenticated, boardData])

  const addCard = useCallback(async (boardId, columnId, cardData) => {
    const tempId = uuidv4()
    const newCard = {
      id: tempId,
      title: typeof cardData === 'string' ? cardData : cardData.title,
      description: typeof cardData === 'string' ? '' : (cardData.description || ''),
      labels: typeof cardData === 'string' ? [] : (cardData.labels || []),
      priority: typeof cardData === 'string' ? 'medium' : (cardData.priority || 'medium')
    }

    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = board.columns.map(col => {
        if (col.id === columnId) {
          return { ...col, cards: [...col.cards, newCard] }
        }
        return col
      })

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken()) {
      try {
        const result = await cardsApi.create(columnId, newCard)
        // Update with real ID
        setBoardData(prev => {
          const board = prev[boardId]
          if (!board) return prev

          const newColumns = board.columns.map(col => {
            if (col.id === columnId) {
              return {
                ...col,
                cards: col.cards.map(c => c.id === tempId ? { ...c, id: result.card.id } : c)
              }
            }
            return col
          })

          return {
            ...prev,
            [boardId]: { ...board, columns: newColumns }
          }
        })
      } catch (err) {
        console.error('Failed to add card:', err)
        // Remove optimistic card on failure
        setBoardData(prev => {
          const board = prev[boardId]
          if (!board) return prev

          const newColumns = board.columns.map(col => {
            if (col.id === columnId) {
              return { ...col, cards: col.cards.filter(c => c.id !== tempId) }
            }
            return col
          })

          return {
            ...prev,
            [boardId]: { ...board, columns: newColumns }
          }
        })
      }
    }
  }, [isAuthenticated])

  const updateCard = useCallback(async (boardId, columnId, cardId, updates) => {
    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = board.columns.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId ? { ...card, ...updates } : card
            )
          }
        }
        return col
      })

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken()) {
      try {
        await cardsApi.update(cardId, updates)
      } catch (err) {
        console.error('Failed to update card:', err)
        loadBoard(boardId)
      }
    }
  }, [isAuthenticated])

  const deleteCard = useCallback(async (boardId, columnId, cardId) => {
    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = board.columns.map(col => {
        if (col.id === columnId) {
          return { ...col, cards: col.cards.filter(card => card.id !== cardId) }
        }
        return col
      })

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken()) {
      try {
        await cardsApi.delete(cardId)
      } catch (err) {
        console.error('Failed to delete card:', err)
        loadBoard(boardId)
      }
    }
  }, [isAuthenticated])

  const addColumn = useCallback(async (boardId, title) => {
    const tempId = uuidv4()

    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      return {
        ...prev,
        [boardId]: {
          ...board,
          columns: [...board.columns, { id: tempId, title, cards: [] }]
        }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken()) {
      try {
        const result = await columnsApi.create(boardId, title)
        // Update with real ID
        setBoardData(prev => {
          const board = prev[boardId]
          if (!board) return prev

          return {
            ...prev,
            [boardId]: {
              ...board,
              columns: board.columns.map(col =>
                col.id === tempId ? { ...col, id: result.column.id } : col
              )
            }
          }
        })
      } catch (err) {
        console.error('Failed to add column:', err)
        // Remove optimistic column on failure
        setBoardData(prev => {
          const board = prev[boardId]
          if (!board) return prev

          return {
            ...prev,
            [boardId]: {
              ...board,
              columns: board.columns.filter(col => col.id !== tempId)
            }
          }
        })
      }
    }
  }, [isAuthenticated])

  const renameColumn = useCallback(async (boardId, columnId, newTitle) => {
    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = board.columns.map(col =>
        col.id === columnId ? { ...col, title: newTitle } : col
      )

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken()) {
      try {
        await columnsApi.update(columnId, { title: newTitle })
      } catch (err) {
        console.error('Failed to rename column:', err)
        loadBoard(boardId)
      }
    }
  }, [isAuthenticated])

  const deleteColumn = useCallback(async (boardId, columnId) => {
    // Store for rollback
    const prevBoard = boardData[boardId]

    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      return {
        ...prev,
        [boardId]: {
          ...board,
          columns: board.columns.filter(col => col.id !== columnId)
        }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken()) {
      try {
        await columnsApi.delete(columnId)
      } catch (err) {
        console.error('Failed to delete column:', err)
        // Rollback
        setBoardData(prev => ({
          ...prev,
          [boardId]: prevBoard
        }))
      }
    }
  }, [isAuthenticated, boardData])

  const moveColumn = useCallback(async (boardId, fromIndex, toIndex) => {
    // Get the current order for API call
    const board = boardData[boardId]

    // Optimistic update
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = [...board.columns]
      const [movedColumn] = newColumns.splice(fromIndex, 1)
      newColumns.splice(toIndex, 0, movedColumn)

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })

    // Persist to API if authenticated
    if (isAuthenticated && getAuthToken() && board) {
      try {
        const newOrder = [...board.columns]
        const [moved] = newOrder.splice(fromIndex, 1)
        newOrder.splice(toIndex, 0, moved)
        await boardsApi.reorderColumns(boardId, newOrder.map(c => c.id))
      } catch (err) {
        console.error('Failed to reorder columns:', err)
        loadBoard(boardId)
      }
    }
  }, [isAuthenticated, boardData])

  const initializeBoard = useCallback(async (boardId) => {
    if (boardData[boardId]) return // Board already loaded

    if (isAuthenticated && getAuthToken()) {
      await loadBoard(boardId)
    } else {
      // Guest mode - create default columns
      setBoardData(prev => ({
        ...prev,
        [boardId]: {
          columns: [
            { id: uuidv4(), title: 'To Do', cards: [] },
            { id: uuidv4(), title: 'In Progress', cards: [] },
            { id: uuidv4(), title: 'Done', cards: [] },
          ]
        }
      }))
    }
  }, [isAuthenticated, boardData])

  const createBoard = useCallback(async (name, icon = '📋', color = 'sky') => {
    if (isAuthenticated && getAuthToken()) {
      try {
        const result = await boardsApi.create(name, icon, color)
        setBoardsList(prev => [...prev, result.board])
        setBoardData(prev => ({
          ...prev,
          [result.board.id]: {
            columns: result.columns.map(c => ({ ...c, cards: [] }))
          }
        }))
        return result.board
      } catch (err) {
        console.error('Failed to create board:', err)
        throw err
      }
    } else {
      // Guest mode
      const newBoard = {
        id: uuidv4(),
        name,
        icon,
        color
      }
      setBoardsList(prev => [...prev, newBoard])
      setBoardData(prev => ({
        ...prev,
        [newBoard.id]: {
          columns: [
            { id: uuidv4(), title: 'To Do', cards: [] },
            { id: uuidv4(), title: 'In Progress', cards: [] },
            { id: uuidv4(), title: 'Done', cards: [] },
          ]
        }
      }))
      return newBoard
    }
  }, [isAuthenticated])

  const renameBoard = useCallback(async (boardId, newName) => {
    // Optimistic update
    setBoardsList(prev =>
      prev.map(b => b.id === boardId ? { ...b, name: newName } : b)
    )

    if (isAuthenticated && getAuthToken()) {
      try {
        await boardsApi.update(boardId, { name: newName })
      } catch (err) {
        console.error('Failed to rename board:', err)
        loadBoards()
      }
    }
  }, [isAuthenticated])

  const deleteBoard = useCallback(async (boardId) => {
    // Optimistic update
    setBoardsList(prev => prev.filter(b => b.id !== boardId))
    setBoardData(prev => {
      const { [boardId]: _, ...rest } = prev
      return rest
    })

    if (isAuthenticated && getAuthToken()) {
      try {
        await boardsApi.delete(boardId)
      } catch (err) {
        console.error('Failed to delete board:', err)
        loadBoards()
      }
    }
  }, [isAuthenticated])

  return (
    <BoardContext.Provider value={{
      boardData,
      boardsList,
      isLoading,
      error,
      loadBoard,
      loadBoards,
      moveCard,
      moveColumn,
      addCard,
      updateCard,
      deleteCard,
      addColumn,
      renameColumn,
      deleteColumn,
      initializeBoard,
      createBoard,
      renameBoard,
      deleteBoard
    }}>
      {children}
    </BoardContext.Provider>
  )
}

export function useBoard() {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider')
  }
  return context
}
