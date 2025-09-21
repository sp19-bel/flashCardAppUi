import React, { useState } from 'react'
import './DeckForm.css'

const DeckForm = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim()
      })
      setTitle('')
      setDescription('')
    }
  }

  return (
    <div className="deck-form-overlay">
      <div className="deck-form">
        <h2>Create New Deck</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Deck Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter deck title..."
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter deck description..."
              rows="3"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeckForm
