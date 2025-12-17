import { useState, useMemo, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import Column from './Column'
import Card from './Card'
import { useBoard } from '../context/BoardContext'
import './Board.css'

function Board({ boardId, boardName }) {
  const { boardData, moveCard, moveColumn, addColumn } = useBoard()
  const [activeCard, setActiveCard] = useState(null)
  const [activeColumn, setActiveColumn] = useState(null)
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [isAddingColumn, setIsAddingColumn] = useState(false)

  const columnsContainerRef = useRef(null)

  const board = boardData[boardId]
  const columns = board?.columns || []

  // Handle horizontal scrolling with mouse wheel
  useEffect(() => {
    const container = columnsContainerRef.current
    if (!container) return

    const handleWheel = (e) => {
      // Check if we are scrolling over a column's card list
      // The Event.composedPath() method returns the event's path which is an array of the objects on which listeners will be invoked
      const path = e.composedPath()
      const isOverCardList = path.some(el =>
        el.classList && el.classList.contains('column-cards')
      )

      if (isOverCardList) {
        // Find that specific column card list
        const cardList = path.find(el => el.classList && el.classList.contains('column-cards'))

        // Check if it actually has overflow
        if (cardList) {
          const hasVerticalOverflow = cardList.scrollHeight > cardList.clientHeight

          // If it has overflow, we let the default behavior happen (vertical scroll)
          // But ONLY if we aren't at the very top scrolling up or very bottom scrolling down
          // Actually, simplest behavior: if over list, let it do its thing. 
          // The browser usually handles "scroll parent if child hits boundary" but here we want to be explicit.

          if (hasVerticalOverflow) return
        }
      }

      // If not over a scrollable list, or list doesn't need scroll, translate Y scrolling to X scrolling
      if (e.deltaY !== 0) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const columnIds = useMemo(() => columns.map(c => c.id), [columns])

  const cardMap = useMemo(() => {
    const map = {}
    columns.forEach(col => {
      col.cards.forEach(card => {
        map[card.id] = { ...card, columnId: col.id }
      })
    })
    return map
  }, [columns])

  const handleDragStart = (event) => {
    const { active } = event
    const activeId = active.id

    // Check if it's a column
    if (columnIds.includes(activeId)) {
      const col = columns.find(c => c.id === activeId)
      setActiveColumn(col)
      setActiveCard(null)
    } else {
      // It's a card
      setActiveCard(cardMap[activeId] || null)
      setActiveColumn(null)
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    setActiveCard(null)
    setActiveColumn(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Check if we're dragging a column
    if (columnIds.includes(activeId)) {
      if (activeId !== overId && columnIds.includes(overId)) {
        const oldIndex = columns.findIndex(c => c.id === activeId)
        const newIndex = columns.findIndex(c => c.id === overId)
        if (oldIndex !== -1 && newIndex !== -1) {
          moveColumn(boardId, oldIndex, newIndex)
        }
      }
      return
    }

    // Otherwise it's a card
    let sourceColId = null
    let sourceIndex = -1
    let destColId = null
    let destIndex = 0

    for (const col of columns) {
      const cardIndex = col.cards.findIndex(c => c.id === activeId)
      if (cardIndex !== -1) {
        sourceColId = col.id
        sourceIndex = cardIndex
        break
      }
    }

    // Determine destination
    const destColumn = columns.find(c => c.id === overId)
    if (destColumn) {
      destColId = destColumn.id
      destIndex = destColumn.cards.length
    } else {
      for (const col of columns) {
        const cardIndex = col.cards.findIndex(c => c.id === overId)
        if (cardIndex !== -1) {
          destColId = col.id
          destIndex = cardIndex
          break
        }
      }
    }

    if (sourceColId && destColId && (sourceColId !== destColId || sourceIndex !== destIndex)) {
      moveCard(boardId, sourceColId, destColId, sourceIndex, destIndex)
    }
  }

  const handleAddColumn = (e) => {
    e.preventDefault()
    if (newColumnTitle.trim()) {
      addColumn(boardId, newColumnTitle.trim())
      setNewColumnTitle('')
      setIsAddingColumn(false)
    }
  }

  return (
    <div className="board">
      <header className="board-header">
        <div className="board-header-content">
          <h1 className="board-title">{boardName || 'Board'}</h1>
          <div className="board-meta">
            <span className="board-stat">{columns.length} columns</span>
            <span className="board-stat-divider">·</span>
            <span className="board-stat">
              {columns.reduce((acc, col) => acc + col.cards.length, 0)} cards
            </span>
          </div>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="board-columns"
          ref={columnsContainerRef}
        >
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((column, index) => (
              <Column
                key={column.id}
                column={column}
                boardId={boardId}
                index={index}
              />
            ))}
          </SortableContext>

          {/* Add Column */}
          <div className="add-column-wrapper">
            {isAddingColumn ? (
              <form onSubmit={handleAddColumn} className="add-column-form">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title..."
                  className="add-column-input"
                  autoFocus
                />
                <div className="add-column-actions">
                  <button type="submit" className="add-column-submit">
                    Add
                  </button>
                  <button
                    type="button"
                    className="add-column-cancel"
                    onClick={() => {
                      setIsAddingColumn(false)
                      setNewColumnTitle('')
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="add-column-btn"
                onClick={() => setIsAddingColumn(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Column</span>
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeColumn ? (
            <div className="column-drag-overlay">
              <Column
                column={activeColumn}
                boardId={boardId}
                index={0}
                isDragOverlay
              />
            </div>
          ) : activeCard ? (
            <Card
              card={activeCard}
              columnId={activeCard.columnId}
              boardId={boardId}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default Board

