import React from 'react'
import './Progress.css'

const Progress = ({ progress, decks }) => {
  return (
    <div className="progress">
      <h1> Your Progress</h1>
      <p>Progress tracking and analytics coming soon!</p>
      <p>This will show:</p>
      <ul>
        <li>Study streaks</li>
        <li>Cards mastered vs. still learning</li>
        <li>Time spent studying</li>
        <li>Deck completion percentages</li>
        <li>Performance analytics</li>
      </ul>
    </div>
  )
}

export default Progress
