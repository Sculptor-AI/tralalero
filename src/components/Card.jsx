import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoard } from '../context/BoardContext'
import { LABEL_COLORS, PRIORITY_CONFIG } from '../utils/constants'
import CardModal from './CardModal'
import './Card.css'

function Card({ card, columnId, boardId, isDragging: isDraggingProp, index }) {
  const { deleteCard, updateCard } = useBoard()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: index !== undefined ? `${index * 50}ms` : '0ms',
  }

  const actualIsDragging = isDraggingProp || isDragging

  const handleSave = (updates) => {
    updateCard(boardId, columnId, card.id, updates)
  }

  if (isEditing) {
    return (
      <CardModal
        card={card}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${actualIsDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      {/* Labels */}
      {card.labels && card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map(label => (
            <span
              key={label}
              className="card-label"
              style={{
                background: LABEL_COLORS[label]?.bg || 'rgba(161, 161, 170, 0.15)',
                color: LABEL_COLORS[label]?.color || '#a1a1aa',
              }}
            >
              {LABEL_COLORS[label]?.label || label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="card-title">{card.title}</h4>

      {/* Description */}
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}

      {/* Footer */}
      <div className="card-footer">
        {card.priority && (
          <span
            className="card-priority"
            style={{ color: PRIORITY_CONFIG[card.priority]?.color }}
          >
            <span
              className="priority-dot"
              style={{ background: PRIORITY_CONFIG[card.priority]?.color }}
            />
            {PRIORITY_CONFIG[card.priority]?.label}
          </span>
        )}

        <div className="card-actions">
          <button
            className="card-action-btn"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>

          {showMenu && (
            <div className="card-menu">
              <button
                className="card-menu-item"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                  setShowMenu(false)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
              <button
                className="card-menu-item delete"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteCard(boardId, columnId, card.id)
                  setShowMenu(false)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drag Handle Indicator */}
      <div className="card-drag-handle">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </div>
    </div>
  )
}

export default Card
