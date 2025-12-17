import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Card from './Card'
import { useBoard } from '../context/BoardContext'
import { LABEL_COLORS, PRIORITY_CONFIG } from '../utils/constants'
import './Column.css'

function Column({ column, boardId, index, isDragOverlay }) {
  const { addCard, renameColumn, deleteColumn } = useBoard()
  const [isAdding, setIsAdding] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [newCardPriority, setNewCardPriority] = useState('medium')
  const [newCardLabels, setNewCardLabels] = useState([])
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(column.title)

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleAddCard = (e) => {
    e.preventDefault()
    if (newCardTitle.trim()) {
      addCard(boardId, column.id, {
        title: newCardTitle.trim(),
        priority: newCardPriority,
        labels: newCardLabels
      })
      setNewCardTitle('')
      setNewCardPriority('medium')
      setNewCardLabels([])
      setIsAdding(false)
    }
  }

  const toggleLabel = (labelKey) => {
    if (newCardLabels.includes(labelKey)) {
      setNewCardLabels(newCardLabels.filter(l => l !== labelKey))
    } else {
      setNewCardLabels([...newCardLabels, labelKey])
    }
  }

  const handleRename = (e) => {
    e.preventDefault()
    if (renameValue.trim() && renameValue.trim() !== column.title) {
      renameColumn(boardId, column.id, renameValue.trim())
    }
    setIsRenaming(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${column.title}" and all its cards?`)) {
      deleteColumn(boardId, column.id)
    }
    setShowMenu(false)
  }

  const columnColors = [
    'var(--color-accent-coral)',
    'var(--color-accent-amber)',
    'var(--color-accent-sage)',
    'var(--color-accent-sky)',
    'var(--color-accent-violet)',
  ]

  return (
    <div
      ref={setSortableRef}
      className={`column ${isOver ? 'drag-over' : ''} ${isDragging ? 'dragging' : ''} ${isDragOverlay ? 'drag-overlay' : ''}`}
      style={{ ...style, animationDelay: `${index * 80}ms` }}
    >
      <div className="column-header" {...attributes} {...listeners}>
        <div className="column-header-left">
          <span className="column-drag-handle">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="6" r="1.5"/>
              <circle cx="15" cy="6" r="1.5"/>
              <circle cx="9" cy="12" r="1.5"/>
              <circle cx="15" cy="12" r="1.5"/>
              <circle cx="9" cy="18" r="1.5"/>
              <circle cx="15" cy="18" r="1.5"/>
            </svg>
          </span>
          <span
            className="column-indicator"
            style={{ background: columnColors[index % columnColors.length] }}
          />
          {isRenaming ? (
            <form onSubmit={handleRename} className="column-rename-form">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setRenameValue(column.title)
                    setIsRenaming(false)
                  }
                }}
                className="column-rename-input"
                autoFocus
              />
            </form>
          ) : (
            <h3
              className="column-title"
              onDoubleClick={() => setIsRenaming(true)}
              title="Double-click to rename"
            >
              {column.title}
            </h3>
          )}
          <span className="column-count">{column.cards.length}</span>
        </div>
        <div className="column-menu-wrapper">
          <button
            className="column-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
          {showMenu && (
            <div className="column-menu">
              <button
                className="column-menu-item"
                onClick={() => {
                  setIsRenaming(true)
                  setShowMenu(false)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Rename
              </button>
              <button
                className="column-menu-item delete"
                onClick={handleDelete}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={setDroppableRef} className="column-cards">
        <SortableContext
          items={column.cards.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card, cardIndex) => (
            <Card
              key={card.id}
              card={card}
              columnId={column.id}
              boardId={boardId}
              index={cardIndex}
            />
          ))}
        </SortableContext>

        {/* Add Card Form */}
        {isAdding ? (
          <form onSubmit={handleAddCard} className="add-card-form">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter card title..."
              className="add-card-input"
              autoFocus
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleAddCard(e)
                }
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewCardTitle('')
                  setNewCardPriority('medium')
                  setNewCardLabels([])
                }
              }}
            />

            <div className="add-card-options">
              <div className="option-row">
                <span className="option-label">Priority:</span>
                <div className="priority-select">
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      className={`mini-priority-btn ${newCardPriority === key ? 'selected' : ''}`}
                      onClick={() => setNewCardPriority(key)}
                      title={config.label}
                      style={{
                        '--btn-color': config.color,
                        background: newCardPriority === key ? config.color : 'transparent',
                        borderColor: config.color
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="option-row">
                <span className="option-label">Tags:</span>
                <div className="mini-label-list">
                  {Object.entries(LABEL_COLORS).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      className={`mini-label-btn ${newCardLabels.includes(key) ? 'selected' : ''}`}
                      onClick={() => toggleLabel(key)}
                      style={{
                        background: newCardLabels.includes(key) ? config.bg : 'transparent',
                        color: newCardLabels.includes(key) ? config.color : 'var(--color-text-tertiary)',
                        borderColor: newCardLabels.includes(key) ? config.color : 'var(--color-border)'
                      }}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="add-card-actions">
              <button type="submit" className="add-card-submit">
                Add Card
              </button>
              <button
                type="button"
                className="add-card-cancel"
                onClick={() => {
                  setIsAdding(false)
                  setNewCardTitle('')
                  setNewCardPriority('medium')
                  setNewCardLabels([])
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
            className="add-card-btn"
            onClick={() => setIsAdding(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default Column
