import React from 'react'
import { Link } from 'react-router-dom'
import './DeckCard.css'

const DeckCard = ({ deck, onDelete }) => {
  const { id, title, description, cards, createdAt } = deck
  const cardCount = cards?.length || 0

  return (
    <div className="deck-card">
      <div className="deck-card-header">
        <h3>{title}</h3>
        <button 
          className="delete-btn"
          onClick={() => onDelete(id)}
          title="Delete deck"
        >
          ×
        </button>
      </div>
      
      <p className="deck-description">{description}</p>
      
      <div className="deck-stats">
        <span className="card-count">{cardCount} cards</span>
        <span className="created-date">
          Created {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="deck-actions">
        <Link to={`/study/${id}`} className="btn btn-primary">
          Study
        </Link>
        <button className="btn btn-secondary">
          Edit
        </button>
      </div>
    </div>
  )
}

export default DeckCard
