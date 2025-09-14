import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')

  const courses = [
    {name: 'Introduction to python programming', code: 'ENGR 1330' },
    {name: 'Introduction to Texas government', code: 'POLS 2306' }
  ]

  const handleCourseSelect = (course) => {
    setSelectedCourse(course)
    setChatMessages([{
      id: 1,
      text: `Great! I can help you with ${course.name} concepts. What would you like to learn about?`,
      isBot: true
    }])
  }

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        text: currentMessage,
        isBot: false
      }
      setChatMessages([...chatMessages, newMessage])
      setCurrentMessage('')
    }
  }

  const handleCreateFlashcards = () => {
    alert('Flashcards created! (This would integrate with your AI backend)')
  }

  return (
    <div className="app">
      <header className="header">
        <h1>TTU AI Learning Bot</h1>
        <p>Choose a course to get started</p>
      </header>

      {!selectedCourse ? (
        <div className="course-selection">
          <h2>Which course can I help you with?</h2>
          <div className="course-grid">
            {courses.map(course => (
              <button
                key={course.id}
                className="course-card"
                onClick={() => handleCourseSelect(course)}
              >
                <h3>{course.code}</h3>
                <p>{course.name}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-header">
            <h2>{selectedCourse.name} Learning Assistant</h2>
            <button 
              className="back-button"
              onClick={() => {
                setSelectedCourse(null)
                setChatMessages([])
              }}
            >
              Back to Courses
            </button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.map(message => (
              <div key={message.id} className={`message ${message.isBot ? 'bot' : 'user'}`}>
                {message.text}
              </div>
            ))}
          </div>
          
          <div className="chat-input">
            <input
              type="text"
              placeholder="Put the concepts here..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          
          <div className="flashcard-section">
            <button 
              className="create-flashcards-btn"
              onClick={handleCreateFlashcards}
            >
              Create Flashcards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
