import React from 'react'
import { Link } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  return (
    <nav className="navigation">
      <Link to="/" className="nav-logo">
         Flashcards
      </Link>
      
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/decks" className="nav-link">Decks</Link>
        <Link to="/progress" className="nav-link">Progress</Link>
      </div>
    </nav>
  )
}

export default Navigation
