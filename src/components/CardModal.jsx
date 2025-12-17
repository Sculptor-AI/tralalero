import { useState, useEffect } from 'react'
import { LABEL_COLORS, PRIORITY_CONFIG } from '../utils/constants'
import './CardModal.css'

function CardModal({ card, onClose, onSave }) {
    const [title, setTitle] = useState(card.title)
    const [description, setDescription] = useState(card.description || '')
    const [priority, setPriority] = useState(card.priority || 'medium')
    const [labels, setLabels] = useState(card.labels || [])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave({
            title,
            description,
            priority,
            labels
        })
        onClose()
    }

    const toggleLabel = (labelKey) => {
        if (labels.includes(labelKey)) {
            setLabels(labels.filter(l => l !== labelKey))
        } else {
            setLabels([...labels, labelKey])
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="modal-header">
                        <h3>Edit Card</h3>
                        <button type="button" className="close-btn" onClick={onClose}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="modal-input"
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="modal-textarea"
                                rows={4}
                            />
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <div className="priority-options">
                                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                    <label
                                        key={key}
                                        className={`priority-option ${priority === key ? 'selected' : ''}`}
                                        style={{
                                            '--priority-color': config.color,
                                            borderColor: priority === key ? config.color : 'transparent',
                                            background: priority === key ? `color-mix(in srgb, ${config.color} 10%, transparent)` : 'transparent'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={key}
                                            checked={priority === key}
                                            onChange={(e) => setPriority(e.target.value)}
                                        />
                                        <span className="priority-dot" style={{ background: config.color }} />
                                        {config.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Labels</label>
                            <div className="label-options">
                                {Object.entries(LABEL_COLORS).map(([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`label-option ${labels.includes(key) ? 'selected' : ''}`}
                                        onClick={() => toggleLabel(key)}
                                        style={{
                                            background: labels.includes(key) ? config.bg : 'var(--color-bg-secondary)',
                                            color: labels.includes(key) ? config.color : 'var(--color-text-secondary)',
                                            border: labels.includes(key) ? `1px solid ${config.color}` : '1px solid transparent'
                                        }}
                                    >
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-save">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CardModal
