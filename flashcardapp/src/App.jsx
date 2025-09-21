import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Decks from './pages/Decks'
import StudyMode from './pages/StudyMode'
import Progress from './pages/Progress'
import Navigation from './components/Navigation'

function App() {
  const [decks, setDecks] = useState([])
  const [progress, setProgress] = useState({})

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/decks" 
              element={<Decks decks={decks} setDecks={setDecks} />} 
            />
            <Route 
              path="/study/:deckId" 
              element={<StudyMode decks={decks} progress={progress} setProgress={setProgress} />} 
            />
            <Route 
              path="/progress" 
              element={<Progress progress={progress} decks={decks} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
