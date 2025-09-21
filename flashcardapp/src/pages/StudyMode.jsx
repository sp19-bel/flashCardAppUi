import React from 'react'
import { useParams } from 'react-router-dom'

const StudyMode = ({ decks, progress, setProgress }) => {
  const { deckId } = useParams()
  const deck = decks.find(d => d.id === parseInt(deckId))

  if (!deck) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Deck not found</h2>
        <p>The deck you're looking for doesn't exist.</p>
      </div>
    )
  }

  if (!deck.cards || deck.cards.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>{deck.title}</h2>
        <p>This deck doesn't have any cards yet. Add some cards to start studying!</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Study Mode: {deck.title}</h1>
      <p>Study mode coming soon! This will feature flip card animations and progress tracking.</p>
      <p>Cards in this deck: {deck.cards.length}</p>
    </div>
  )
}

export default StudyMode
