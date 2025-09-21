import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className="home">
      <header className="hero">
        <h1>Flashcards Learning App</h1>
        <p>Master any topic with interactive flashcards and progress tracking</p>
        <div className="hero-actions">
          <Link to="/decks" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/progress" className="btn btn-secondary">
            View Progress
          </Link>
        </div>
      </header>
      
      <section className="features">
        <div className="feature">
          <h3>Create Custom Decks</h3>
          <p>Build your own flashcard decks for any subject</p>
        </div>
        <div className="feature">
          <h3>Interactive Study Mode</h3>
          <p>Flip cards with smooth animations to test your knowledge</p>
        </div>
        <div className="feature">
          <h3>Track Progress</h3>
          <p>Monitor your learning progress with detailed analytics</p>
        </div>
        <div className="feature">
          <h3>Gamification</h3>
          <p>Stay motivated with progress tracking and achievements</p>
        </div>
      </section>
    </div>
  )
}

export default Home
