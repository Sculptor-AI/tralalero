import { createContext, useContext, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

const BoardContext = createContext(null)

const initialData = {
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
  const [boardData, setBoardData] = useState(initialData)

  const moveCard = useCallback((boardId, sourceColId, destColId, sourceIndex, destIndex) => {
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = [...board.columns]
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
  }, [])

  const addCard = useCallback((boardId, columnId, cardData) => {
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = board.columns.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: [...col.cards, {
              id: uuidv4(),
              title: typeof cardData === 'string' ? cardData : cardData.title,
              description: typeof cardData === 'string' ? '' : (cardData.description || ''),
              labels: typeof cardData === 'string' ? [] : (cardData.labels || []),
              priority: typeof cardData === 'string' ? 'medium' : (cardData.priority || 'medium')
            }]
          }
        }
        return col
      })

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })
  }, [])

  const updateCard = useCallback((boardId, columnId, cardId, updates) => {
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
  }, [])

  const deleteCard = useCallback((boardId, columnId, cardId) => {
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      const newColumns = board.columns.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            cards: col.cards.filter(card => card.id !== cardId)
          }
        }
        return col
      })

      return {
        ...prev,
        [boardId]: { ...board, columns: newColumns }
      }
    })
  }, [])

  const addColumn = useCallback((boardId, title) => {
    setBoardData(prev => {
      const board = prev[boardId]
      if (!board) return prev

      return {
        ...prev,
        [boardId]: {
          ...board,
          columns: [...board.columns, {
            id: uuidv4(),
            title,
            cards: []
          }]
        }
      }
    })
  }, [])

  const renameColumn = useCallback((boardId, columnId, newTitle) => {
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
  }, [])

  const deleteColumn = useCallback((boardId, columnId) => {
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
  }, [])

  const moveColumn = useCallback((boardId, fromIndex, toIndex) => {
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
  }, [])

  const initializeBoard = useCallback((boardId) => {
    setBoardData(prev => {
      if (prev[boardId]) return prev // Board already exists

      return {
        ...prev,
        [boardId]: {
          columns: [
            { id: uuidv4(), title: 'To Do', cards: [] },
            { id: uuidv4(), title: 'In Progress', cards: [] },
            { id: uuidv4(), title: 'Done', cards: [] },
          ]
        }
      }
    })
  }, [])

  const deleteBoard = useCallback((boardId) => {
    setBoardData(prev => {
      const { [boardId]: _, ...rest } = prev
      return rest
    })
  }, [])

  return (
    <BoardContext.Provider value={{
      boardData,
      moveCard,
      moveColumn,
      addCard,
      updateCard,
      deleteCard,
      addColumn,
      renameColumn,
      deleteColumn,
      initializeBoard,
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
