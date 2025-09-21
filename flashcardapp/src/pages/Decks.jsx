import React, { useState } from 'react'
import DeckCard from '../components/DeckCard'
import DeckForm from '../components/DeckForm'
import './Decks.css'

const Decks = ({ decks, setDecks }) => {
  const [showForm, setShowForm] = useState(false)

  const addDeck = (newDeck) => {
    const deck = {
      id: Date.now(),
      ...newDeck,
      cards: [],
      createdAt: new Date().toISOString()
    }
    setDecks([...decks, deck])
    setShowForm(false)
  }

  const deleteDeck = (deckId) => {
    setDecks(decks.filter(deck => deck.id !== deckId))
  }

  return (
    <div className="decks">
      <header className="decks-header">
        <h1>Your Flashcard Decks</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create New Deck
        </button>
      </header>

      {showForm && (
        <DeckForm 
          onSubmit={addDeck}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="decks-grid">
        {decks.length === 0 ? (
          <div className="empty-state">
            <h3>No decks yet</h3>
            <p>Create your first flashcard deck to get started!</p>
          </div>
        ) : (
          decks.map(deck => (
            <DeckCard 
              key={deck.id}
              deck={deck}
              onDelete={deleteDeck}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default Decks
